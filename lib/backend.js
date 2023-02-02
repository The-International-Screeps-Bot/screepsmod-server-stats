const express = require('express');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')
const log = require('log-to-file');
const fs = require('fs');
const { getConfig } = require("./helpers/functions")
const packageJson = require('../package.json');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

function logIpMiddleware(req, res, next) {
  let ips = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || ''
  ).split(',');

  log(`${ips[0].trim()} - ${req.url}`, 'logs/ips.log')
  next()
}

function securityMiddleware(req, res, next) {
  const key = req.header('key');
  let ips = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || ''
  ).split(',');

  if (serverStatsConfig.secret_key === undefined || serverStatsConfig.secret_key === "NONE") {
    log(`${ips[0].trim()} - ${req.url} with key: ${key}: Access denied`, 'logs/ips.log')
    res.status(403).send('Access denied, improper configuration');
  }
  else if (key === serverStatsConfig.secret_key) {
    log(`${ips[0].trim()} - ${req.url} with key: ${key}: Access granted`, 'logs/ips.log')
    next();
  }
  else {
    log(`${ips[0].trim()} - ${req.url} with key: ${key}: Access denied`, 'logs/ips.log')
    res.status(403).send('Access denied');
  }
}

module.exports = function (config) {
  const db = config.common.storage.db;

  function Rooms() {
    const router = new express.Router();

    router.get('', async (req, res) => {
      try {
        res.json(await db.rooms.find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/objects', async (req, res) => {
      try {
        res.json(await db["rooms.objects"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/intents', async (req, res) => {
      try {
        res.json(await db["rooms.intents"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/flags', async (req, res) => {
      try {
        res.json(await db["rooms.flags"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/terrain', async (req, res) => {
      try {
        res.json(await db["rooms.terrain"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })

    return router;
  }

  function Users() {
    const router = new express.Router();

    router.get('/', async (req, res) => {
      try {
        const users = await db.users.find({});
        if (serverStatsConfig.debug === false) {
          users.forEach(user => {
            delete user._id;
            delete user.salt;
            delete user.password;
            delete user.steam;
            delete user.authTouched
          })
        }
        res.json(users);
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    // router.get('/console', async (req, res) => {
    //   try {
    //     res.json(await db["users.console"].find({}));
    //   } catch (error) {
    //     console.error(req.url, err)
    //     res.status(500).send({ error: err.stack })
    //   }
    // })
    // router.get('/money', async (req, res) => {
    //   try {
    //     res.json(await db["users.money"].find({}));
    //   } catch (error) {
    //     console.error(req.url, err)
    //     res.status(500).send({ error: err.stack })
    //   }
    // })
    // router.get('/notifications', async (req, res) => {
    //   try {
    //     res.json(await db["users.notifications"].find({}));
    //   } catch (error) {
    //     console.error(req.url, err)
    //     res.status(500).send({ error: err.stack })
    //   }
    // })
    // router.get('/resources', async (req, res) => {
    //   try {
    //     res.json(await db["users.resources"].find({}));
    //   } catch (error) {
    //     console.error(req.url, err)
    //     res.status(500).send({ error: err.stack })
    //   }
    // })
    router.get('/power_creeps', async (req, res) => {
      try {
        res.json(await db["users.power_creeps"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })

    return router;
  }

  function Market() {
    const router = new express.Router();

    router.get('/transactions', async (req, res) => {
      try {
        res.json(await db["transactions"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })

    return router;
  }

  config.backend.on('expressPreConfig', function (app) {
    try {
      app.use(bodyParser.json({ limit: '5mb' }));
      app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
      // app.use('/api/stats', limiter)
      serverStatsConfig = getConfig()

      if (serverStatsConfig.rawExports === true) {
        app.use('/api/stats/rooms', securityMiddleware)
        app.use('/api/stats/users', securityMiddleware)
        app.use('/api/stats/market', securityMiddleware)

        app.use('/api/stats/rooms', Rooms());
        app.use('/api/stats/users', Users());
        // app.use('/api/stats/market', Market());
      }

      app.use('/api/stats/server', logIpMiddleware)
      app.get('/api/stats/server', (req, res) => {
        if (!fs.existsSync('roomsObjects.json')) res.send('roomsObjects.json not found')
        else {
          const roomsObjects = fs.readFileSync('roomsObjects.json', 'utf8')
          res.send(roomsObjects)
        }
      })
      app.get('/api/stats/version', (req, res) => {
        res.send(packageJson.version)
      })
    } catch (error) {
      console.log(error)
      log(error, "logs/error_backend.log")
    }
  })
} 
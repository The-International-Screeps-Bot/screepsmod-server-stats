const express = require('express');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')
const packageVersion = "1.0.13"
const log = require('log-to-file');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

function logIp(req, res, next) {
  let ips = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || ''
  ).split(',');

  log(`${ips[0].trim()} - ${req.url}`, 'logs/ips.log')
  next()
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
        res.json(await db.users.find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/console', async (req, res) => {
      try {
        res.json(await db["users.console"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/money', async (req, res) => {
      try {
        res.json(await db["users.money"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/notifications', async (req, res) => {
      try {
        res.json(await db["users.notifications"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
    router.get('/resources', async (req, res) => {
      try {
        res.json(await db["users.resources"].find({}));
      } catch (error) {
        console.error(req.url, err)
        res.status(500).send({ error: err.stack })
      }
    })
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
    app.use(bodyParser.json());
    app.use(limiter)
    app.use(logIp)

    app.use('/api/stats/rooms', Rooms());
    app.use('/api/stats/users', Users());
    app.use('/api/stats/market', Market());

    app.get('/api/stats/version', (req, res) => {
      res.send(packageVersion)
    })
  });
} 
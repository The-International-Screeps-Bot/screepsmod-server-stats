const fs = require('fs')
const log = require('log-to-file');
const { getCreepCost, getDefaultRoomIntentStats } = require("../functions")

function prepareList(roomIntents) {
   const stats = getDefaultRoomIntentStats();

   for (let t = 0; t < roomIntents.length; t++) {
      const intentObjectType = roomIntents[t];
      const intentObjectTypeName = roomIntents[t][0];
      const intentObjects = Object.entries(intentObjectType[1])
      for (let i = 0; i < intentObjects.length; i++) {
         const intentType = intentObjects[i];
         const intentTypeName = intentType[0];
         const intentTypeArray = intentType[1]
         for (let i = 0; i < intentTypeArray.length; i++) {
            const intent = intentTypeArray[i];
            const actualIntent = intent.intent;
            const intentObject = intent.object;

            stats.intentCounts[intentTypeName] = (stats.intentCounts[intentTypeName] || 0) + 1;
            switch (intentTypeName) {
               case "move":
                  if (!intentObject.body.move) intentObject.body.move = { count: 0 }
                  stats.fatigueDecreased += intentObject.body.move.count * 2
                  break;
               case "harvest":
                  stats.energyInflow.harvest += intentObject.body.work.count * 2;
                  break;
               case "withdraw":
               case "transfer":
                  if (actualIntent.resourceType === 'energy') {
                     stats[["transfer"].includes(intentTypeName) ? "energyInflow" : "energyOutflow"][intentTypeName][actualIntent.resourceType] += actualIntent.amount
                  }
                  break;
               case "upgradeController":
               case "build":
               case "repair":
                  stats.energyOutflow[intentTypeName] += intentObject.body.work.count;
                  break;
               case "createCreep":
                  log(`${getCreepCost(actualIntent.body)} - ${actualIntent.body}`, "spawnCost.log")
                  stats.spawnCost += getCreepCost(actualIntent.body);
                  break;
               case "say":
               case "signController":
               case "pickup":
               case "drop":
               case "recycleCreep":
               case "renewCreep":
                  break;
               default:
                  if (!fs.existsSync('intents.txt')) fs.writeFileSync('intents.txt', '')
                  if (!fs.readFileSync('intents.txt').toString().includes(intentTypeName)) fs.appendFileSync('intents.txt', intentTypeName + '\n' + JSON.stringify(actualIntent) + '\n\n' + JSON.stringify(intentObject) + '\n\n')
                  break;
            }
         }
      }
   }

   return stats;
}

module.exports = function prepareRoomsIntents(roomsIntents) {
   const stats = {}

   const users = Object.entries(roomsIntents)
   for (let u = 0; u < users.length; u++) {
      const intentUser = users[u];
      const intentUserName = intentUser[0];
      const rooms = Object.entries(intentUser[1])
      stats[intentUserName] = {}

      for (let r = 0; r < rooms.length; r++) {
         const intentRoom = rooms[r];
         const intentRoomName = intentRoom[0];
         const intents = Object.entries(intentRoom[1])
         stats[intentUserName][intentRoomName] = prepareList(intents)
      }
   }

   return stats
}
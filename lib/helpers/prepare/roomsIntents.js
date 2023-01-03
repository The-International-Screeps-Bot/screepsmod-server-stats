const fs = require('fs')
const { getCreepCost } = require("../functions")

function prepareList(intents, intentType, objectType) {
   const stats = {
      intentCounts: {},
      fatigueDecreased: 0,
      spawnCost: 0,
      energyOutflow: {
         upgradeController: 0,
         build: 0,
         repair: 0,
         withdraw: {
            energy:0
         },
      },
      energyInflow: {
         harvest: 0,
         transfer: {energy:0},
      },
   }

   for (let i = 0; i < intents.length; i++) {
      const intent = intents[i];
      const actualIntent = intent.intent;
      const intentObject = intent.object;

      stats.intentCounts[intentType] = (stats.intentCounts[intentType] || 0) + 1;
      switch (intentType) {
         case "move":
            stats.fatigueDecreased += intentObject.body.move.count * 2
            break;
         case "harvest":
            if (objectType === "source") {
               stats.energyInflow.harvest += intentObject.body.work.count * 2;
            }
            break;
         case "withdraw":
         case "transfer":
            if (actualIntent.resourceType === RESOURCE_ENERGY) {
               stats[intentType === "transfer" ? "energyIncome" : "energyOutflow "][intentType][actualIntent.resourceType] += actualIntent.amount
            }
            break;
         case "upgradeController":
         case "build":
         case "repair":
            stats.energyOutflow[intentType] += intentObject.body.work.count;
            break;
         case "createCreep":
            stats.spawnCost += getCreepCost(actualIntent.body);
            break;
         default:
            if (!fs.existsSync('intents.txt')) fs.writeFileSync('intents.txt', '')
            if (!fs.readFileSync('intents.txt').toString().includes(intentType)) fs.appendFileSync('intents.txt', intentType + '\n' + JSON.stringify(actualIntent) + '\n\n' + JSON.stringify(intentObject) + '\n\n')
            break;
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
         const objectTypes = Object.entries(intentRoom[1])
         stats[intentUserName][intentRoomName] = {}

         for (let t = 0; t < objectTypes.length; t++) {
            const intentObjectType = objectTypes[t];
            const intentObjectTypeName = objectTypes[t][0];
            const intentObjects = Object.entries(intentObjectType[1])
            stats[intentUserName][intentRoomName][intentObjectTypeName] = {}

            for (let i = 0; i < intentObjects.length; i++) {
               const intentType = intentObjects[i];
               const intentTypeName = intentType[0];
               const intentTypeArray = intentType[1]
               stats[intentUserName][intentRoomName][intentObjectTypeName][intentTypeName] = prepareList(intentTypeArray, intentTypeName, intentObjectTypeName)
            }
         }
      }
   }

   return stats
}
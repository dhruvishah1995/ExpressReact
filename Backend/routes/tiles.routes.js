
const { enrichment } = require("../models/index.js");
const tilesCharModel = require("../models/tilesChar.model.js");

module.exports = (app) => {
  const tiles = require("../controllers/tiles.controller.js");
  const tilesChar = require("../controllers/tilesChar.controller.js");
  const createHarness = require("../controllers/createHarness.controller.js");
  const tilePosition = require("../controllers/tilePosition.controller.js");
  const enrichment = require("../controllers/enrichment.controller.js");
  const targetPages = require("../controllers/targetPages.controller.js");

  var router = require("express").Router();

  // Create a new Tiles
  router.post("/refresh", tiles.refresh);
  // router.post("/tilesRefreshFromExcel", tiles.refreshFromExcel);
  
  router.post("/getChars", tilesChar.getChars);
  router.get("/getTile", tiles.getTile);
  router.get("/getTiles", tiles.getTileNameId);
  router.post("/harness", createHarness.bulkcreate);
  // router.post("/harness", createHarness.create);

  router.post("/enrichments", enrichment.bulkcreate);
  router.get("/enrichments", enrichment.findByIdfromHarness);
  router.get("/enrichmentsForUI", enrichment.findEnrichments);
  router.post("/refreshEnrichments", enrichment.refreshEnrichments);
  router.put("/enrichments/", enrichment.update);
  router.delete("/enrichments/", enrichment.delete);
  
  router.get("/newId" , createHarness.getIdforNewRow);
  router.delete("/harness/", createHarness.delete);
  router.put("/harness/", createHarness.update);
  router.put("/enrichmentUpdate/", createHarness.addUpdateEnrichmentRecords);
  router.get("/harness", createHarness.find);

  router.post("/tilePosition", tilePosition.bulkcreate);
  router.get("/tilePosition", tilePosition.getTilePositions);
  router.post("/tilePositionRefreshFromExcel", tilePosition.refreshFromExcel);

  router.post("/targetPages", targetPages.bulkcreate);
  router.get("/targetPages",  targetPages.getTargetPagesByType);
  router.post("/targetPagesRefreshFromExcel", targetPages.refreshFromExcel);
  app.use("/api/tiles", router);
};

// code block
// // Define a route with a route parameter
// app.get('/api/tiles/getTile/:id', (req, res) => {
//   const tileId = req.params.id;
//   // Use tileId as needed
//   res.json({ tileId });
// });

// const express = require('express');
// const router = express.Router();
// const { YourModel } = require('../models'); // Replace 'YourModel' with your Sequelize model

// // Route to handle batch updates
// router.put('/batch-update', async (req, res) => {
//   const updates = req.body; // Expect an array of updates in the request body

//   try {
//     // Extract the IDs and update data from the array of updates
//     const idsToUpdate = updates.map(update => update.id);
//     const updateData = updates.map(update => ({
//       ...update,
//       id: undefined, // Remove the 'id' field from the update data
//     }));

//     // Perform the batch update using Sequelize's bulkUpdate method
//     await YourModel.bulkUpdate(updateData, { fields: Object.keys(updateData[0]), where: { id: idsToUpdate } });

//     return res.status(200).json({ message: 'Batch update successful' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;

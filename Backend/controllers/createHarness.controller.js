const axios = require("axios");
const db = require("../models");
const tileChar = require("../controllers/tilesChar.controller");
const tiles = require("../controllers/tiles.controller");
const enrichment = require("../controllers/enrichment.controller");
const harness_Bell = db.createHarness_Bell;
const harness_Virgin = db.createHarness_Virgin;
const harness_Lucky = db.createHarness_Lucky;

// Delete a harness with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.query.id;
  let tileId, bupId, enrichment, harnessId = "";
  const harnessDBObj = await this.getHarnessDBObject(req.query.brand);
  try {
    await harnessDBObj.findOne({ where: { id: id }, raw: true }).then((data) => {
      if (data && data.enrichment) {
        tileId = data.tileId;
        bupId = data.bupId;
        enrichment = data.enrichment;
        harnessId = data.harnessId;
      }
    });
    const item = await harnessDBObj.destroy({
      where: { id: id },
      raw: true
    });
    if (item >= 1) {
      res.status(200).json({
        message: item + "Harness deleted successfully",
        enrichment: enrichment,
        bupId: bupId,
        tileId: tileId,
        harnessId: harnessId
      });
    } else {
      res.status(500).send({
        message: "Could not delete harness record",
      });
    }
  }
  catch {
    res.status(500).send({
      message: "Could not delete harness record",
    });
  }
};

// Update a harness with the specified id in the request
exports.update = async (req, res) => {
  const id = req.body.id;

  const dbObj = await this.getHarnessDBObject(req.body.brand);

  try {
    const item = await dbObj.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const as = await tiles.getTileByTileId(req.body.tileId);
    // enrichment = as.charsId;

    req.body.enrichment = as.charsId !== null ? true : false;

    const updatedData = await item.update(req.body);

    if (updatedData.dataValues) {
      res.status(200).send(updatedData.dataValues);
    } else {
      res.status(500).send({
        message:
          "Some error occurred while updating the records.",
      });
    }
    // return res.status(200).json({ message: "Item updated successfully", });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not update Item with id=" + id,
      message: error,
    });
  }
};

// Find a harness with the specified harness id in the request
exports.find = async (req, res) => {
  const harnessId = req.query.harnessId;
  const bupId = req.query.bupId;
  const dbObj = await this.getHarnessDBObject(req.query.brand);

  try {
    let records = "";
    if (harnessId === undefined && bupId === undefined) {
      records = await dbObj.findAll({ raw: true });
    } else if (harnessId !== undefined && bupId === undefined) {
      records = await dbObj.findAll({
        where: {
          harnessId: harnessId
        },
        raw: true
      });
    } else if (harnessId === undefined && bupId !== undefined) {
      records = await dbObj.findAll({
        where: {
          bupId: bupId,
        },
        raw: true
      });
    } else if (harnessId !== undefined && bupId !== undefined) {
      records = await dbObj.findAll({
        where: {
          harnessId: harnessId,
          bupId: bupId,
        },
        raw: true
      });
    }

    if (records.length == 0) {
      return res.status(200).json([]);
    } else {
      try {
        const response = await axios.get(`http://${process.env.APP_ENV}:${process.env.BACKEND_PORT}/api/tiles/getTiles`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const tileswithNameId = response.data;
          const newHarnessData = records.map((element) => (
            {
              ...element,
              tileName: tileswithNameId.filter(tile => tile.tileId == element.tileId)[0].name
            }
          ));

          return res.status(200).send(newHarnessData);
        } else {
          throw new Error(`HTTP request failed with status ${response.status}`);
        }
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }

    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Something went wrong finding data with harnessId" + harnessId,
    });
  }
};

//Create a harness
exports.bulkcreate = async (req, res) => {
  // Validate request
  const itemsToAdd = req.body;

  if (itemsToAdd.length === 0) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const manipulateData = async (itemsToAdd) => {
    const modifiedItems = await Promise.all(
      itemsToAdd.map(async (tileData) => {
        tileData.harnessId = tileData.harnessId;
        tileData.tileId = tileData.tileId;
        tileData.bupId = tileData.bupId;
        tileData.targetPages = tileData.targetPages === '' ? [] : tileData.targetPages;
        tileData.tilePosition = tileData.tilePosition;
        tileData.channel = tileData.channel;
        tileData.serviceId = tileData.serviceId;
        tileData.accountId = tileData.accountId;
        const as = await tiles.getTileByTileId(tileData.tileId);
        tileData.enrichment = as.charsId !== null ? true : false;

        return tileData;
      })
    );
    return modifiedItems;
  };

  try {
    const dataToAdd = await manipulateData(itemsToAdd);
    const dbObj = await this.getHarnessDBObject(req.query.brand);
    const createdData = await dbObj.bulkCreate(dataToAdd);
    if (createdData.length > 0) {
      res.status(200).send(createdData);
    } else {
      res.status(500).send({
        message:
          "Some error occurred while creating the records.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating the records.",
    });
  }
};

exports.getHarnessDBObject = async (brand) => {
  let dbObj;
  if (brand === "virgin") {
    dbObj = harness_Virgin;
  } else if (brand === "bell") {
    dbObj = harness_Bell;
  } else if (brand === "lucky") {
    dbObj = harness_Lucky;
  }
  return dbObj;
}

exports.deleteEnrichmentIfExistByParam = async (brand, id) => {

  const response = await axios.get(`http://${process.env.APP_ENV}:${process.env.BACKEND_PORT}/api/tiles/enrichments?idFromHarnessTable=${id}&brand=${brand}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  // if (response.status === 200) {
  //   if (response.data !== undefined && Object.keys(response.data).length > 0) {
  //     Object.keys(response.data).map(async (tilecharsData) => {
  //       response.data[tilecharsData].map((tileData) => {
  //         if (param === "tileId" && tileData.tileId === tileId) {
  let enrichmentDbObj = enrichment.getEnrichmentDBObject(brand);
  enrichmentDbObj.destroy({ where: { idFromHarnessTable: id }, raw: true })
  //         }
  //       });
  //     })
  //   }
  // }
}

// Update a enrichemnt records for updated harness records
exports.addUpdateEnrichmentRecords = async (req, res) => {
  const id = req.body.id;
  try {
    const as = await tiles.getTileByTileId(req.body.tileId);
    // enrichment = as.charsId;

    req.body.enrichment = as.charsId !== null ? true : false;
    if (req.body.oldTileId && req.body.oldTileId !== req.body.tileId) {
      this.deleteEnrichmentIfExistByParam(req.body.brand, req.body.id);
      const response = await axios.post(`http://${process.env.APP_ENV}:${process.env.BACKEND_PORT}/api/tiles/enrichments?brand=${req.body.brand}`,
        [req.body], {
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.status === 200) {
        res.status(200).send("Updated Sucessfully");
      } else {
        res.status(500).send({
          message:
            "Some error occurred while updating the records.",
        });
      }
    } else {

      await enrichment.updateHarnessDataForEnrichment(req.body.brand, id, req.body);

    }

    //return res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not update Item with id=" + id,
      message: error,
    });
  }
};


exports.getIdforNewRow = async (req, res) => {
  const dbObj = await this.getHarnessDBObject(req.query.brand);
  try {
    const newRecord = await dbObj.create({
      harnessId: req.query.harnessId,
      bupId: req.query.bupId
    });
    res.status(200).send(newRecord.dataValues);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).send(error);
  }
}
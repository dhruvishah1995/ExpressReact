const axios = require("axios");
const db = require("../models");
const { json } = require("body-parser");
const enrichment_Bell = db.enrichment_Bell;
const enrichment_Virgin = db.enrichment_Virgin;
const enrichment_Lucky = db.enrichment_Lucky;
const tiles = require("../controllers/tiles.controller");
const { getTileCharData } = require("./tilesChar.controller");

exports.bulkcreate = async (req, res) => {

  const harnessData = req.body;
  let brand = req.query.brand;

  let enrichmentData = [];

  try {
    harnessData.map(async (tileData) => {
      const as = await tiles.getTileByTileId(tileData.tileId);

      if (tileData.enrichment && as.charsId !== null) {
        const response = await axios.post(`http://${process.env.APP_ENV}:${process.env.BACKEND_PORT}/api/tiles/getChars`,
          { "ids": as.charsId }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {

          response.data.map(async (tilecharsData) => {
            let enrichmentItem = {};
            enrichmentItem.harnessId = tileData.harnessId;
            enrichmentItem.bupId = tileData.bupId;
            enrichmentItem.tileId = tileData.tileId;
            enrichmentItem.serviceId = tileData.serviceId;
            enrichmentItem.idFromHarnessTable = tileData.id;
            enrichmentItem.charsId = tilecharsData.id;
            enrichmentItem.characteristic = tilecharsData.name;
            enrichmentItem.value = tileData.serviceId;
            enrichmentData.push(enrichmentItem);
          })
        }

        const dbObj = await this.getEnrichmentDBObject(brand);
        const enrichCreatedData = await dbObj.bulkCreate(enrichmentData);

        if (enrichCreatedData.length > 0) {
          res.status(200).send(enrichCreatedData);
        } else {
          res.status(500).send({
            message:
              "Some error occurred while creating enrichment records.",
          });
        }

      }
    });


  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while creating enrichment records.",
    });
  }

};

exports.findByBupId = async (req, res) => {
  const dbObj = await this.getEnrichmentDBObject(req.query.brand);

    dbObj.findAll({
      where: { bupId: req.query.bupId, harnessId: req.query.harnessId },
      raw: true
    })
      .then(async (data) => {
  
  
        await Promise.all(data.map(async (item) => {
          let tileData = await tiles.findOne(item.tileId);
          const tileName = tileData.get('name');
          item.tileName = tileName;
        }));
  
        // let values = data.reduce(function (r, a) {
        //   r[a.tileName] = r[a.tileName] || [];
        //   r[a.tileName].push(a);
        //   return r;
        // }, Object.create(null));
  
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving enrichments.",
        });
      });
  
 

};

exports.findByIdfromHarness = async (req, res) => {
  const dbObj = await this.getEnrichmentDBObject(req.query.brand);

  dbObj.findAll({
    where: { idFromHarnessTable: req.query.idFromHarnessTable },
    raw: true
  })
    .then(async (data) => {

      // addEnrichmentRecord(data);
      await Promise.all(data.map(async (item) => {
        let tileData = await tiles.findOne(item.tileId);
        const tileName = tileData.get('name');
        item.tileName = tileName;
      }));

      // let values = data.reduce(function (r, a) {
      //   r[a.tileName] = r[a.tileName] || [];
      //   r[a.tileName].push(a);
      //   return r;
      // }, Object.create(null));

      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving enrichments.",
      });
    });

};

exports.findEnrichments = async (req, res) => {
  const dbObj = await this.getEnrichmentDBObject(req.query.brand);

    await dbObj.findAll({
      where: { bupId: req.query.bupId, harnessId: req.query.harnessId },
      raw: true
    }).then(async (data) => {
      await Promise.all(data.map(async (item) => {
        let tileData = await tiles.findOne(item.tileId);
        const tileName = tileData.get('name');
        item.tileName = tileName;
      }));
  
      // let values = data.reduce(function (r, a) {
      //   r[a.tileName] = r[a.tileName] || [];
      //   r[a.tileName].push(a);
      //   return r;
      // }, Object.create(null));
  
      res.send(data);
    })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving enrichments.",
        });
      });
  
  
 
};
// Update a enrichment with the specified id in the request
exports.update = async (req, res) => {
  const id = req.body.id;

  const dbObj = await this.getEnrichmentDBObject(req.body.brand);

  try {
    const item = await dbObj.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    await item.update(req.body);
    return res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not update Item with id=" + id,
      message: error,
    });
  }
};

exports.getEnrichmentDBObject = (brand) => {
  let dbObj;
  if (brand === "virgin") {
    dbObj = enrichment_Virgin;
  } else if (brand === "bell") {
    dbObj = enrichment_Bell;
  } else if (brand === "lucky") {
    dbObj = enrichment_Lucky;
  }
  return dbObj;
}

// Update a enrichment with the specified id in the request
exports.delete = async (req, res) => {
  const dbObj = await this.getEnrichmentDBObject(req.query.brand);
  try {
    const item = await dbObj.destroy({ where: { idFromHarnessTable: req.query.idFromHarnessTable, harnessId: req.query.harnessId, tileId: req.query.tileId, bupId: req.query.bupId }, raw: true });
    if (item >= 1) {
      res.status(200).json({ message: item + " Enrichment deleted successfully" });
    } else {
      res.status(500).send({
        message: "Could not delete enrichment record",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not delete enrichment record ",
    });
  }
};



exports.refreshEnrichments = async (req, res) => {

  const dbObj = await this.getEnrichmentDBObject(req.body.brand); 

  await dbObj.findAll({
    where: { bupId: req.body.bupId, harnessId: req.body.harnessId },
    raw: true
  }).then(async (enrichmentData) => {
   
    const transformedData = enrichmentData.reduce((acc, item) => {
      const { idFromHarnessTable, tileId, charsId } = item;

      if (!acc[idFromHarnessTable]) {
        acc[idFromHarnessTable] = { tileId, charsId: [] };
      }
      acc[idFromHarnessTable].charsId.push(charsId);
      return acc;
    }, {});
    
    Object.keys(transformedData).map(async (item) => {
      const as = await tiles.getTileByTileId(transformedData[item].tileId);


      const oldArr = transformedData[item].charsId;
      const newArr = as.charsId.split(',');

      const added = newArr.filter(x => !oldArr.includes(x));
      const removed = oldArr.filter(x => !newArr.includes(x));

      added.map(async (id) => {
        let foundArr = enrichmentData.filter(enrichment_item => enrichment_item.idFromHarnessTable === parseInt(item))[0];

        let enrichmentItem = {};
        let tilecharsData = await getTileCharData(id);

        enrichmentItem.harnessId = foundArr.harnessId;
        enrichmentItem.bupId = foundArr.bupId;
        enrichmentItem.tileId = foundArr.tileId;
        enrichmentItem.serviceId = foundArr.serviceId;
        enrichmentItem.idFromHarnessTable = item;
        enrichmentItem.charsId = id;
        enrichmentItem.characteristic = tilecharsData.name;
        enrichmentItem.value = foundArr.serviceId;

        await dbObj.bulkCreate([enrichmentItem]);
      });

      removed.map(async (id) => {
        await dbObj.destroy({ where: { idFromHarnessTable: item, charsId: id }, raw: true });
      });
      
    });

    res.status(200).json({
      message: "refresh done"
    });
  })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while performing actions on enrichments.",
      });
    });
};

exports.updateHarnessDataForEnrichment = async (brand, id, harness) => {

  const dbObj = await this.getEnrichmentDBObject(brand);

  dbObj.findAll({
    where: { idFromHarnessTable: id },
    raw: true
  }).then(async (data) => {

    data.map(async (item) => {
      const enrichment = await dbObj.findByPk(item.id);
      item.serviceId = harness.serviceId;
      item.bupId = harness.bupId;
      await enrichment.update(item)
    })

  });
}
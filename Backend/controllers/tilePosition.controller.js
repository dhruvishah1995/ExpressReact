const db = require("../models");
const TilePositions = db.tilePosition;

exports.getTilePositions = (req, res) => {
    TilePositions.findAll()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving tiles.",
        });
      });
  };

  //insert tilepositions
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
        itemsToAdd.map(async (tilePositionData) => {
          tilePositionData.name = tilePositionData.name;
          return tilePositionData;
        })
      );
      return modifiedItems;
    };
  
    try {
      const dataToAdd = await manipulateData(itemsToAdd);
      const createdData = await TilePositions.bulkCreate(dataToAdd);
      res.send(createdData);
    } catch (error) {
      res.status(500).send({
        message:
          error.message || "Some error occurred while creating the records.",
      });
    }
  };

exports.refreshFromExcel = async (req, res) => {
  await TilePositions.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
  });

  try {
    const jsonData = await TilePositions.bulkCreate(req.body);
    res.send(jsonData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};
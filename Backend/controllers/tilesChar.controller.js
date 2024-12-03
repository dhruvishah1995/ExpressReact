const db = require("../models");
const TilesChar = db.tilesChar;
const Tiles = db.tiles;

// Function to find a record by name, creating it if it doesn't exist
exports.findOne = async (charName) => {
  try {
    // Attempt to find the record by name
    const data = await TilesChar.findOne({ where: { name: charName } });

    if (data === null) {
      // Create the record if it doesn't exist
      const createdData = await exports.create(charName);
      return createdData; // Return the newly created record
    } else {
      console.log("Record already exists with name " + charName);
      return data; // Return the existing record
    }
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error for the caller to handle
  }
};

// Function to create and save a new record by name
exports.create = async (charName) => {
  try {
    // Create a new record with the provided name
    const tileChar = {
      name: charName,
    };

    // Save the record in the database and return it
    const createdData = await TilesChar.create(tileChar);

    return createdData;
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error for the caller to handle
  }
};

// Function to get characters by IDs provided in the request body
exports.getChars = async (req, res) => {
  try {
    if (req.body.ids != null) {
      const input = req.body.ids;
      const array = input.split(",");

      const promises = array.map(async (id) => {
        // Attempt to find a record by ID
        const data = await TilesChar.findByPk(id);
        if (data !== null) {
          // console.log(data.name);
          return { id: id, name: data.name };
        } else {
          return null; // Return null for records not found
        }
      });

      const result = await Promise.all(promises);

      // Filter out null values from the result array
      const filterResult = result.filter((f) => f !== null);
      res.send(filterResult);
    } else {
      res.send(null);
    }
  } catch (error) {
    if (error.message === "Not found") {
      res.status(404).send("Not found");
    } else {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
};


exports.refresh = async (req, res) => {
  await TilesChar.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
  });

  await TilesChar.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
  });

  try {
    res.send(req.body);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};

exports.getTileCharData = async (id) => {
  try {
    // Wait for the promise to resolve and get the data
    let tilecharsData = await db.tilesChar.findOne({ where: { id: id }, raw: true });
    
    // Return the data if needed
    return tilecharsData;
  } catch (error) {
    // Handle any errors that occur during the query
    console.error('Error retrieving tile chars data:', error);
  }
}
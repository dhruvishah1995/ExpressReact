const axios = require("axios");
const db = require("../models");
const tileChar = require("../controllers/tilesChar.controller");
// const { json } = require("body-parser");
const Tiles = db.tiles;

exports.refresh = async (req, res) => {
  await Tiles.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
  });

  // await TilesChar.destroy({
  //   where: {},
  //   truncate: true,
  //   restartIdentity: true,
  // });

  try {
    const jsonData = await getAllTile();
    res.send(jsonData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};

async function getAllTile() {
  try {
    const response = await axios.get(process.env.GET_TILES_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const jsonData = response.data;

      for (const element of jsonData) {
        if (Object.keys(element.associatedAttribute).length > 0) {
          const charArray = element.associatedAttribute;
          const charsArray = await Promise.all(
            charArray.map(async (chars) => {
              const charsId = await getCharacteristicId(chars);
            
              return charsId;
            })
          );
          element.charsId = charsArray.join(",");

          // element.charsID = charsArray;
        }
        // const parts = element.tileID.split("-");
        // const lastBlock = parts[parts.length - 1];
        // element.tileID = lastBlock;
      }

      // await Promise.all(promises);
      const tileRecords = jsonData.map((element) => ({
        name: element.tileName,
        brand: element.brand,
        charsId: element.charsId,
        tileId: element.tileID,

        // charsId: element.charsID,
      }));

      await Tiles.bulkCreate(tileRecords);

      return jsonData;
    } else {
      throw new Error(`HTTP request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getCharacteristicId(charName) {
  const tid = await tileChar.findOne(charName);
  if (tid != null) {
    // console.log(tid.id + "  " + tid.name);
    return tid.id;
  } else return "";
}

// Find a single tile with an id
exports.findOne = async (tileId) => {
  try {
    const id = tileId;
    // Retrieve the tile data
    const tileData = await Tiles.findOne({
      where: { tileId: tileId },
    })

    if (tileData === null) {
      return "Data not found";
    } else {
      const req = {
        body: {
          ids: tileData.charsId,
        },
      };
      // Create a promise for getting chars
      const charsPromise = new Promise((resolve, reject) => {
        const res = {
          send: (data) => {
            resolve(data); // Resolve the promise with data
          },
          status: (code) => {
            // Handle status codes if needed
            reject(new Error("Failed to get chars"));
          },
        };
        // Call the getChars function and pass req and res
        tileChar.getChars(req, res);
      });
      // Await the chars promise
      const chars = await charsPromise;
      if (chars === null) {
      } else {
         //console.log("Here is chars:", chars);
        tileData.charsId = chars;
      }
      return tileData; // Return the tile data
    }
  } catch (error) {
    console.error(error);
    return "An error occurred";
  }
};

exports.getTile = async (req, res) => {
  tileId = req.query.id;
  const pol = await this.findOne(tileId);
  if (pol != null) {
  } else {
    console.log("hey null here");
  }
  res.send(pol);
};

exports.getTileNameId = (req, res) => {
  const type = req.query.type;

if(type) {
  Tiles.findAll({ attributes: ["name", "tileId"], where: { brand: req.query.type.charAt(0).toUpperCase() + req.query.type.slice(1) }})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving tiles.",
      });
    });

} else {
  Tiles.findAll({ attributes: ["name", "tileId"] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving tiles.",
      });
    });
}
  
};

exports.getTileByTileId = async (tileId) => {
  const pol = await Tiles.findOne({ where: { tileId: tileId } });
  if (pol != null) {
    return pol;
  } else {
    return null;
  }
};

// exports.refreshFromExcel = async (req, res) => {
//   await Tiles.destroy({
//     where: {},
//     truncate: true,
//     restartIdentity: true,
//   });

//   await TilesChar.destroy({
//     where: {},
//     truncate: true,
//     restartIdentity: true,
//   });

//   try {
//     const jsonData = await getAllTileFromReq(req.body);
//     res.send(jsonData);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error occurred");
//   }
// };

// async function getAllTileFromReq(req) {
//   try{
    
//     if (req.length > 0) {
//       const jsonData = req;

//       for (const element of jsonData) {
//         if (associatedAttribute && Object.keys(associatedAttribute).length > 0) {
//           const charArray = associatedAttribute;
//           const charsArray = await Promise.all(
//             charArray.map(async (chars) => {
//               const charsId = await getCharacteristicId(chars);
            
//               return charsId;
//             })
//           );
//           element.charsId = charsArray.join(",");

//           // element.charsID = charsArray;
//         }
//         // const parts = element.tileID.split("-");
//         // const lastBlock = parts[parts.length - 1];
//         // element.tileID = lastBlock;
//       }

//       // await Promise.all(promises);
//       const tileRecords = jsonData.map((element) => ({
//         name: element.name,
//         brand: element.brand,
//         charsId: element.charsId,
//         tileId: element.tileId,

//         // charsId: element.charsID,
//       }));

//       await Tiles.bulkCreate(tileRecords);

//       return jsonData;
//     } else {
//       throw new Error(`HTTP request failed with status ${response.status}`);
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     throw new Error(`HTTP request failed with status ${response.status}`);
//     //throw error;
//   }
// }
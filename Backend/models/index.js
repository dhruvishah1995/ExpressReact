const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tiles = require("./tiles.model.js")(sequelize, Sequelize);
db.tilesChar = require("./tilesChar.model.js")(sequelize, Sequelize);
db.createHarness_Bell = require("./createTable_Bell.model.js")(sequelize, Sequelize);
db.createHarness_Virgin = require("./createTable_Virgin.model.js")(sequelize, Sequelize);
db.createHarness_Lucky = require("./createTable_Lucky.model.js")(sequelize, Sequelize);
db.enrichment_Bell = require("./enrichment_Bell.model.js")(sequelize, Sequelize);
db.enrichment_Lucky = require("./enrichment_Lucky.model.js")(sequelize, Sequelize);
db.enrichment_Virgin = require("./enrichment_Virgin.model.js")(sequelize, Sequelize);
db.tilePosition = require("./tilePosition.model.js")(sequelize, Sequelize);
db.targetPages = require("./targetPages.model.js")(sequelize, Sequelize);
module.exports = db;

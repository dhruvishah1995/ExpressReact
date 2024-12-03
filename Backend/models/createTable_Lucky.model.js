const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const createHarness = sequelize.define("createHarness_Lucky", {
    harnessId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tileId: {
      type: Sequelize.STRING,
    },
    bupId: {
      type: Sequelize.STRING,
    },
    channel: {
      type: Sequelize.STRING,
    },
    targetPages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    tilePosition: {
      type: Sequelize.STRING,
    },
    serviceId: {
      type: Sequelize.STRING,
    },
    accountId: {
      type: Sequelize.STRING,
    },
    enrichment: {
      type: Sequelize.BOOLEAN,
    },
  }, {
    freezeTableName: true,
  });

  return createHarness;
};

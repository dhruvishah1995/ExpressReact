module.exports = (sequelize, Sequelize) => {
  const TilesChar = sequelize.define("tilesChar", {
    name: {
      type: Sequelize.STRING,
    }
  }, {
    freezeTableName: true,
  });

  return TilesChar;
};

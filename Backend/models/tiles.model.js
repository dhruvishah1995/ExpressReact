module.exports = (sequelize, Sequelize) => {
  const Tiles = sequelize.define("tiles", {
    tileId: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    brand: {
      type: Sequelize.STRING,
    },
    charsId: {
      type: Sequelize.STRING,
    },
  }, {
    freezeTableName: true,
  });

  return Tiles;
};

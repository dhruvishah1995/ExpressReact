module.exports = (sequelize, Sequelize) => {
    const TilePosition = sequelize.define("tilePosition", {
      name: {
        type: Sequelize.STRING,
      }
    }, {
      freezeTableName: true,
    });
  
    return TilePosition;
  };
  
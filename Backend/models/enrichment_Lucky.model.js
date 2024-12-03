module.exports = (sequelize, Sequelize) => {
  const enrichmentItem = sequelize.define("enrichment_Lucky", {
    harnessId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    idFromHarnessTable:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    tileId: {
      type: Sequelize.STRING,
    },
    bupId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: Sequelize.STRING,
    },
    charsId:{
      type: Sequelize.STRING,
    },
    characteristic: {
      type: Sequelize.STRING,
    },
    value: {
      type: Sequelize.STRING,
    },
  }, {
    freezeTableName: true,
  });

  return enrichmentItem;
};
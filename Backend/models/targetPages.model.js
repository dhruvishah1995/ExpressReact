module.exports = (sequelize, Sequelize) => {
    const TargetPages = sequelize.define("targetPages", {
      type: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      }
    }, {
      freezeTableName: true,
    });
  
    return TargetPages;
  };
  
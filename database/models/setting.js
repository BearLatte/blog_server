"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init(
    {
      openCommentType: DataTypes.TINYINT(1),
      gitPagesType: DataTypes.TINYINT(1),
      showICP: DataTypes.TINYINT(1),
      icpDomain: DataTypes.STRING,
      icpNo: DataTypes.STRING,
      policeProvince: DataTypes.STRING,
      policeNo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Setting",
      timestamps: false,
    }
  );
  return Setting;
};

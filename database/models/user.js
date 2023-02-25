"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      account: DataTypes.STRING,
      password: DataTypes.STRING,
      nickName: DataTypes.STRING,
      avatar: DataTypes.TEXT,
      phone: DataTypes.STRING,
      editorType: DataTypes.TINYINT(1),
      profession: DataTypes.STRING,
      introduction: DataTypes.TEXT,
      roleType: DataTypes.TINYINT(4),
      lastLoginTime: DataTypes.DATE,
      roleTypeName: DataTypes.STRING,
      editorTypeName: DataTypes.STRING,
      statusName: DataTypes.STRING,
      status: DataTypes.TINYINT(4),
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};

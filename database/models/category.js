"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init(
    {
      cover: DataTypes.STRING,
      categoryName: DataTypes.STRING,
      categoryDesc: DataTypes.TEXT,
      categoryType: DataTypes.TINYINT(1),
      userId: DataTypes.STRING,
      nickName: DataTypes.STRING,
      sort: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};

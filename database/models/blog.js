"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Blog.init(
    {
      userId: DataTypes.INTEGER,
      nickName: DataTypes.STRING,
      cover: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      markdownContent: DataTypes.TEXT,
      editorType: DataTypes.TINYINT(1),
      editorTypeName: DataTypes.STRING,
      allowComment: DataTypes.TINYINT(1),
      allowCommentTypeName: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      categoryName: DataTypes.STRING,
      publishStatus: DataTypes.TINYINT(1),
      publishStatusName: DataTypes.STRING,
      sourceType: DataTypes.TINYINT(1),
      sourceTypeName: DataTypes.STRING,
      reprintUri: DataTypes.STRING,
      summary: DataTypes.STRING,
      tag: DataTypes.STRING,
      blogType: DataTypes.TINYINT(1),
      delType: DataTypes.TINYINT(1),
      pBlogId: DataTypes.INTEGER,
      sort: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  Blog.associate = function (models) {
    Blog.hasMany(Blog, { as: "children", foreignKey: "pBlogId" });
    // models.Blog.hasMany(models.Blog, { as: "children", foreignKey: "pBlogId" });
  };
  return Blog;
};

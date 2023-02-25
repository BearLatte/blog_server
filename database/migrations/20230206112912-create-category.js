"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "自增主键",
      },
      cover: {
        type: Sequelize.STRING,
        comment: "分类封面",
      },
      categoryName: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "分类名称",
      },
      categoryDesc: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "分类描述",
      },
      categoryType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        comment: "分类类型，0：博客分类，1：专题分类",
      },
      sort: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: "排序字段",
      },
      userId: {
        type: Sequelize.STRING,
        comment: "用户id",
      },
      nickName: {
        type: Sequelize.STRING,
        comment: "用户昵称",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "创建时间",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "最后更新时间",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Categories");
  },
};

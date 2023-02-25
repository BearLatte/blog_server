"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "自增主键",
      },
      account: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        comment: "账户名称，唯一",
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "账户密码",
      },
      status: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.TINYINT(4),
        comment: "账户状态，0: 已删除，1：启用，2：禁用",
      },
      nickName: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "用户昵称",
      },
      avatar: {
        type: Sequelize.TEXT,
        defaultValue: "/avatars/avatar.jpg",
        comment: "用户头像",
      },
      phone: {
        type: Sequelize.STRING,
        comment: "手机号码",
      },
      editorType: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.TINYINT(1),
        comment: "编辑器类型，0：markdown，1：富文本",
      },
      profession: {
        type: Sequelize.STRING,
        comment: "职业",
      },
      introduction: {
        type: Sequelize.TEXT,
        comment: "自我介绍",
      },
      roleType: {
        allowNull: false,
        defaultValue: 2,
        type: Sequelize.TINYINT(4),
        comment: "角色类型, 0: 超级管理员，1：管理员，2：普通用户",
      },
      lastLoginTime: {
        type: Sequelize.DATE,
        comment: "最后登录时间",
      },
      roleTypeName: {
        defaultValue: "普通用户",
        type: Sequelize.STRING,
        comment: "角色类型名称",
      },
      editorTypeName: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "富文本",
      },
      statusName: {
        defaultValue: "启用",
        type: Sequelize.STRING,
        comment: "账户状态描述",
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
    await queryInterface.dropTable("Users");
  },
};

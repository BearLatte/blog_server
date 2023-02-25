"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.TINYINT(1),
      },
      openCommentType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "是否开启评论，默认不开启",
      },
      gitPagesType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "是否开启GitPages， 默认不开启",
      },
      showICP: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "是否开启公安备案和ICP备案信息， 默认不开启",
      },
      icpDomain: {
        type: Sequelize.STRING,
        comment: "ICP备案域名",
      },
      icpNo: {
        type: Sequelize.STRING,
        comment: "ICP备案号",
      },
      policeProvince: {
        type: Sequelize.STRING,
        comment: "公安备案省份",
      },
      policeNo: {
        type: Sequelize.STRING,
        comment: "公安备案号",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Settings");
  },
};

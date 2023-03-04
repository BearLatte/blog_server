"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          account: "admin",
          // 密码 888888
          password: "sN/DLLtukCIaTL6U39H6S8GLfRvwcPOtGawujBk9yPVIVE3wsG5HomvalthKimMqtM4pTjIGK1htxTwyn+CbSikwivN0M5Kv5zzaZvFsOwadqn7gYhJCulvnoA48AiucmJvK1BARIoUc2hHskNUxu6czUkuDb6pGgOqnc4mQpIE=",
          nickName: "修改为自己想要的名字",
          status: true,
          avatar: "",
          phone: "13611173280",
          profession: "全栈工程师",
          introduction: "全栈工程师",
          editorType: 0,
          roleType: 0,
          roleTypeName: "超级管理员",
          editorTypeName: "markdown",
          statusName: "启用",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

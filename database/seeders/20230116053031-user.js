"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          account: "admin",
          password:
            "Ic7C+GrOOCUGs8fhHT9oo1pFVxu+CydC1sltPU/o+YpShHEh2liodL4OLwf6zwShpcKVMytLGHiylE+FYnY3A+Pq/AxuisEeEGkvusAPl/iIYBqNjrdCBP8JRfjYP0cUaLE5YQ44Gq0M4qoQWdSonmSfD7C0eIY7tgBXVhaaGwc=",
          nickName: "Tim",
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

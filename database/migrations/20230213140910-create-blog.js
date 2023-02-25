"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Blogs", {
      // 唯一标识
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "自增主键",
      },

      // 用户 id
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: "用户id",
      },

      // 用户昵称
      nickName: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "用户昵称",
      },

      // 博客封面
      cover: {
        type: Sequelize.STRING,
        comment: "博客封面",
      },

      // 博客标题
      title: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "博客标题",
      },

      // HTML 内容
      content: {
        type: Sequelize.TEXT,
        comment: "博客 HTML 内容",
      },

      // markdown 内容
      markdownContent: {
        type: Sequelize.TEXT,
        comment: "博客 markdown 内容",
      },

      // 编辑器类型 0:富文本 , 1: markdown
      editorType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        comment: "编辑器类型 0:markdown , 1: 富文本",
      },

      // 编辑器类型名称
      editorTypeName: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "编辑器类型名称",
      },

      // 是否允许评论
      allowComment: {
        type: Sequelize.TINYINT(1),
        comment: "是否允许评论",
      },

      // 允许评论的类型名称
      allowCommentTypeName: {
        type: Sequelize.STRING,
        comment: "评论类型描述",
      },

      // 分类id,主题分类中子节点为null
      categoryId: {
        type: Sequelize.INTEGER,
        comment: "分类id，主题分类中子节点为null",
      },

      // 分类名称，主题分类中子节点为null
      categoryName: {
        type: Sequelize.STRING,
        comment: "分类名称，主题分类中子节点为null",
      },

      // 发布状态 0: 草稿，1：已发布
      publishStatus: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "发布状态 0: 草稿，1：已发布",
      },

      // 发布状态文字描述
      publishStatusName: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "草稿",
        comment: "发布状态文字描述",
      },

      // 文章来源类型 0：原创 1：转载
      sourceType: {
        type: Sequelize.TINYINT(1),
        comment: "文章来源类型 0：原创 1：转载",
      },

      // 文章来源文字描述
      sourceTypeName: {
        type: Sequelize.STRING,
        comment: "文章来源文字描述",
      },

      // 原文地址
      reprintUri: {
        type: Sequelize.STRING,
        comment: "原文地址",
      },

      // 博客简介
      summary: {
        type: Sequelize.STRING,
        comment: "博客简介",
      },

      // 标签
      tag: {
        type: Sequelize.STRING,
        comment: "标签",
      },
      // 专题博客排序字段
      sort: {
        type: Sequelize.INTEGER,
        comment: "排序字段，专题博客必传",
      },

      // 是否放入回收站，0：否，1：是
      delType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "是否放入回收站，0：否，1：是",
      },

      // 父级博客 id
      pBlogId: {
        type: Sequelize.INTEGER,
        comment: "父级博客 id",
      },

      blogType: {
        allowNull: false,
        type: Sequelize.TINYINT(1),
        comment: "博客类型，0：普通博客， 1: 专题博客",
      },

      // 创建时间
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "创建时间",
      },

      // 更新时间
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "最后更新时间",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Blogs");
  },
};

// 专题路由实现模块
const models = require("../database/models"); // 数据库模型对象
const path = require("path");
const fs = require("fs");
const { Sequelize } = require("../database/models");
const NeedModule = require('../utils/NodeTree')
const {
  configCover,
  batchProcessBlogFile4Add,
  repalceBlogContent,
  batchProcessBlogFils4Remove,
  awaitWrap,
} = require("../utils/Tools");

// 导入全局常量
const { pathReg4Add, pathReg4Remove } = require("../global");

// 新增专题
exports.addNewSpecial = async (req, res) => {
  // 1. 配置基本参数
  const obj = {
    ...req.body,
    userId: req.auth.id,
    nickName: req.auth.nickName,
    categoryType: 1,
  };

  // 处理封面信息
  configCover(obj.cover, async (err, cover) => {
    if (err) return res.config(err.message);
    obj.cover = cover;

    // 执行新增专题操作
    const result = await models.Category.create(obj);
    res.config("新增专题成功", 0, result);
  });
};

// 删除专题
exports.deleteSpecial = async (req, res) => {
  // 先查询该分类下是否有博客，如果博客数量不为0，禁止删除
  const blogResult = await models.Blog.findOne({
    attributes: [
      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM Blogs WHERE Blogs.categoryId = ${req.params.id})`
        ),
        "blogCount",
      ],
    ],
  });

  if (blogResult !== null && blogResult.toJSON().blogCount > 0) {
    return res.config("当前主题中文章不为空，请查看回收站内文章");
  }

  let deleteResult = await models.Category.findByPk(req.params.id);
  if (req.auth.roleType === 2 && deleteResult.userId !== req.auth.id) {
    return res.config("权限不够，请联系管理员");
  }
  const resultObj = deleteResult.toJSON();
  // 删除封面
  const coverPath = path.join(
    __dirname,
    "../upload",
    resultObj.cover ? resultObj.cover : ""
  );
  const isFile = fs.lstatSync(coverPath).isFile();
  if (isFile) {
    fs.unlinkSync(coverPath);
  }

  deleteResult = await deleteResult.destroy();
  res.config("删除成功", 0, deleteResult);
};

// 修改专题
exports.updateSpecial = (req, res) => {
  // 处理封面
  configCover(req.body.cover, async (err, cover) => {
    if (err) return res.config(err.message);
    req.body.cover = cover;

    // 根据 id 查询要修改的分类
    const result = await models.Category.findByPk(req.body.id);

    // 删除旧的封面
    const oldCover = result.toJSON().cover;
    const coverPath = path.join(
      __dirname,
      "../upload",
      oldCover ? oldCover : ""
    );
    if (fs.lstatSync(coverPath).isFile()) {
      fs.unlinkSync(coverPath);
    }
    // 更新信息
    result.update(req.body);
    res.config("修改成功", 0, result);
  });
};

// 根据 id 获取专题详情
exports.getSpecialById = async (req, res) => {
  const [err, result] = await awaitWrap(
    models.Category.findByPk(req.params.specialId)
  );
  if (err) {
    return res.config("err.message");
  }
  res.config("查询成功", 0, result);
};

// 获取所有专题列表
exports.getAllSpecials = async (req, res) => {
  // 当前页数
  const pageNo = parseInt(req.query.pageNo) || 1;
  // 每页显示数量
  const pageSize = parseInt(req.query.pageSize) || 10;
  // 配置条件, 普通用户只能看到自己的专题
  const where = { categoryType: 1, userId: { [Sequelize.Op.ne]: null } };

  // 执行查询操作
  const result = await models.Category.findAndCountAll({
    attributes: [
      "id",
      "cover",
      "sort",
      "userId",
      "nickName",
      "categoryType",
      "categoryName",
      "categoryDesc",

      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM Blogs WHERE Blogs.categoryId = Category.id)`
        ),
        "blogCount",
      ],
      [
        Sequelize.literal(
          `(SELECT id FROM Blogs WHERE Blogs.categoryId = Category.id limit 1)`
        ),
        "firstBlogId",
      ],
    ],
    where,
    order: [["sort", "ASC"]],
    offset: (pageNo - 1) * pageSize,
    limit: pageSize,
  });

  const data = {
    totalCount: result.count,
    list: result.rows,
    pageNo: pageNo,
    pageSize: pageSize,
  };
  res.config("获取成功", 0, data);
};

// 专题下的文章新增接口实现
exports.addNewBlog = (req, res) => {
  req.body.publishStatus = 1;
  req.body.publishStatusName = "已发布";
  this.autoSave(req, res);
};

// 自动保存
exports.autoSave = async (req, res) => {
  // 组装数据
  const obj = {
    ...req.body,
    userId: req.body.userId ? req.body.userId : req.auth.id,
    nickName: req.body.nickName ? req.body.nickName : req.auth.nickName,
  };
  obj.title = obj.title.trim();
  obj.editorTypeName = obj.editorType === 0 ? "markdown" : "富文本";
  obj.blogType = 1;
  const special = await models.Category.findByPk(obj.categoryId);
  obj.categoryName = special.toJSON().categoryName;

  if (!obj.id) {
    // 配置排序字段
    const temp = await models.Blog.findAll({
      where: {
        blogType: 1,
        userId: obj.userId,
        pBlogId: obj.pBlogId,
        categoryId: obj.categoryId,
      },
      order: [["sort", "DESC"]],
      limit: 1,
    });

    if (temp.length > 0) {
      let tempObj = temp[0].toJSON();
      obj.sort = obj.id === tempObj.id ? obj.sort : tempObj.sort + 1;
    } else {
      obj.sort = 1;
    }
  }

  // 处理博客内容中的多媒体文件
  let matchs = obj.content.match(pathReg4Add)
    ? obj.content.match(pathReg4Add)
    : [];

  // 去重
  matchs = Array.from(new Set(matchs));

  // 移动多媒体文件到永久保存目录
  batchProcessBlogFile4Add(matchs, (err) => {
    if (err) return res.config(err.message);
  });

  obj.markdownContent = repalceBlogContent(obj.markdownContent);
  obj.content = repalceBlogContent(obj.content);

  const result = await models.Blog.bulkCreate([obj], {
    validate: true,
    updateOnDuplicate: Object.keys(obj),
  });

  res.config("保存成功", 0, result);
};

// 博客标记删除
exports.blogMarkDelete = async (req, res) => {
  console.log("当前删除的博客id是", req.params.id);

  const node = new NeedModule(req.params.id);
  const nodeTree = await node.getRootNode();

  if (nodeTree[0].dataValues.children.length !== 0) {
    return res.config("请先删除下级文章");
  }

  const currentBlog = nodeTree[0];

  // 更新排序字段
  const sortResult = await models.Blog.findAll({
    where: {
      pBlogId: currentBlog.pBlogId,
      sort: {
        [Sequelize.Op.gte]: currentBlog.sort,
      },
    },
  });

  if (sortResult) {
    for (let i = 0; i < sortResult.length; i++) {
      sortResult[i].sort -= 1;
      await sortResult[i].save();
    }
  }

  currentBlog.delType = 1;
  const [error, result] = await awaitWrap(currentBlog.save());
  if (error) return res.config(error.message);
  res.config("删除成功", 0, result);
};

// 博客排序
exports.specialBlogSort = async (req, res) => {
  const childNodes = req.body.blogIds.split(",");
  // 获取当前操作的博客
  const currentBlog = await models.Blog.findByPk(req.body.blogId);
  // 更新所有子节点
  if (childNodes.indexOf("-1") !== -1) {
    return res.config("排序必须保证有单一的根节点");
  }
  currentBlog.pBlogId = req.body.pBlogId === "-1" ? null : req.body.pBlogId;
  await currentBlog.save();
  if (childNodes.length > 0) {
    for (let i = 0; i < childNodes.length; i++) {
      const blog = await models.Blog.findByPk(childNodes[i]);
      blog.sort = i + 1;
      await blog.save();
    }
  }

  res.config("排序成功", 0);
};

// 获取专题下的文章列表
exports.getAllSpecialBlogList = async (req, res) => {
  // 实现自查询的树结构，最多三层结构
  // const nodeTree = await models.Blog.findAll({
  //   where: {
  //     categoryId: req.params.categoryId,
  //     pBlogId: null,
  //   },
  //   include: {
  //     model: models.Blog,
  //     as: "children",
  //     required: true,
  //     include: {
  //       all: true,
  //       nested: true,
  //     },
  //   },
  // });

  // 获取主题信息组装根节点
  let special = await models.Category.findByPk(req.params.categoryId);
  if (!special) return res.config("查询成功", 0); // 查询不到主题分类

  special = special.toJSON();
  // 配置根节点
  const obj = {
    id: -1,
    title: special.categoryName,
    categoryId: special.id,
  };

  // 执行递归查询
  const node = new NeedModule(req.params.categoryId);
  const nodeTree = await node.getNeedsTree();
  obj.children = nodeTree;
  res.config("查询成功", 0, [obj]);
};


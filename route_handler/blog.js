// 导入数据库模型对象
const models = require("../database/models");
const Op = models.Sequelize.Op;
// 导入全局常量
const { pathReg4Add, pathReg4Remove } = require("../global");
const path = require("path");
const fs = require("fs");

const {
  configCover,
  repalceBlogContent,
  batchProcessBlogFile4Add,
  trimString,
  awaitWrap,
  batchProcessBlogFils4Remove,
} = require("../utils/Tools");

// 获取所有分类博客列表，实现条件查询，分页查询
exports.getAllBlogs = async (req, res) => {
  // 当前页数
  const pageNo = parseInt(req.query.pageNo) || 1;
  // 每页显示数量
  const pageSize = parseInt(req.query.pageSize) || 10;
  // 标题的模糊值
  const titleFuzzy = req.query.titleFuzzy;
  // 发布状态
  const publishStatus = req.query.publishStatus;
  // 分类 id
  const categoryId = req.query.categoryId;

  let where = {
    delType: 0,
    blogType: 0,
  };

  if (titleFuzzy) {
    where.title = {
      [Op.like]: "%" + titleFuzzy + "%",
    };
  }

  if (publishStatus && publishStatus !== "-1") {
    where.publishStatus = publishStatus;
  }

  if (categoryId && categoryId !== "-1") {
    where.categoryId = categoryId;
  }

  const result = await models.Blog.findAndCountAll({
    where: where,
    order: [["id", "DESC"]],
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

// 获取单条博客
exports.getBlogById = async (req, res) => {
  if (!req.params.id) return res.config("博客id不能为空");
  const result = await models.Blog.findByPk(req.params.id);
  res.config("获取成功", 0, result);
};

// 新增或修改 bolg
exports.upinsertBlog = async (req, res) => {
  // 判断权限，超级管理员可以修改所有，管理员和普通用户只能修改自己的
  if (req.body.id) {
    if (req.auth.roleType !== 0 && req.body.userId !== req.auth.id) {
      return res.config("权限不够，请联系管理员");
    }
  }

  const obj = {
    ...req.body,
    title: req.body.title.trim(),
    blogType: 0,
  };

  obj.userId = obj.userId ? obj.userId : req.auth.id;
  obj.nickName = obj.nickName ? obj.nickName : req.auth.nickName;

  // 处理分类信息
  const category = await models.Category.findByPk(obj.categoryId);
  obj.categoryName = category.toJSON().categoryName;

  // 处理封面信息
  configCover(obj.cover, async (err, cover) => {
    if (err) return res.config(err.message);
    obj.cover = cover;

    let matchs = [];
    obj.editorType === 1
      ? (matchs = obj.markdownContent.match(pathReg4Add))
      : (matchs = obj.content.match(pathReg4Add));

    // 去重
    matchs = Array.from(new Set(matchs));

    // 移动图片到永久保存目录
    batchProcessBlogFile4Add(matchs, (err) => {
      if (err) return res.config(err.message);
    });

    // 1. 处理markdown 内容
    obj.markdownContent = repalceBlogContent(obj.markdownContent);
    // 处理富文本内容
    obj.content = repalceBlogContent(obj.content);

    obj.editorTypeName = obj.editorType === 1 ? "富文本" : "markdown";
    obj.sourceTypeName = obj.sourceType === 0 ? "原创" : "转载";
    obj.reprintUri = obj.sourceType === 1 ? obj.reprintUri : null;
    obj.allowCommentTypeName = obj.allowCommentType === 0 ? "不允许" : "允许";
    obj.publishStatus = 1;
    obj.publishStatusName = "已发布";

    const result = await models.Blog.bulkCreate([obj], {
      validate: true,
      updateOnDuplicate: Object.keys(obj),
    });
    res.config("博客保存成功", 0, result);
  });
};

// 自动保存接口
exports.autoSave = async (req, res) => {
  const obj = {
    ...req.body,
    title: trimString(req.body.title),
    userId: req.body.userId ? req.body.userId : req.auth.id,
    nickName: req.body.nickName ? req.body.nickName : req.auth.nickName,
    blogType: 0,
  };

  // 处理分类信息
  obj.categoryId = obj.categoryId ? obj.categoryId : 1;
  const category = await models.Category.findByPk(obj.categoryId);
  obj.categoryName = category.toJSON().categoryName;

  let matchs = obj.content.match(pathReg4Add)
    ? obj.content.match(pathReg4Add)
    : [];

  // 去重
  matchs = Array.from(new Set(matchs));

  // 移动图片到永久保存目录
  batchProcessBlogFile4Add(matchs, (err) => {
    if (err) return res.config(err.message);
  });

  obj.markdownContent = repalceBlogContent(obj.markdownContent);
  obj.content = repalceBlogContent(obj.content);
  obj.editorTypeName = obj.editorType === 1 ? "markdown" : "富文本";
  const result = await models.Blog.bulkCreate([obj], {
    validate: true,
    updateOnDuplicate: Object.keys(obj),
  });

  res.config("自动保存成功", 0, result);
};

// 移动博客到回收站，或者还原博客
exports.updateBolgDelType = async (req, res) => {
  const result = await models.Blog.update(
    { delType: req.body.delType },
    {
      where: {
        id: req.params.id,
      },
    }
  );
  if (!result) return res.config("更新失败");
  res.config("更新成功", 0, result);
};

// 获取所有已标记删除的文章
exports.getDelBlogs = async (req, res) => {
  // 当前页数
  const pageNo = parseInt(req.query.pageNo) || 1;
  // 每页显示数量
  const pageSize = parseInt(req.query.pageSize) || 10;
  // 标题的模糊值
  const titleFuzzy = req.query.titleFuzzy;

  let where = {
    delType: 1,
  };

  if (titleFuzzy) {
    where.title = {
      [Op.like]: "%" + titleFuzzy + "%",
    };
  }

  const result = await models.Blog.findAndCountAll({
    where: where,
    order: [["id", "DESC"]],
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

// 执行永久删除博客
exports.deleteBlog = async (req, res) => {
  const [err, currentBlog] = await awaitWrap(
    models.Blog.findByPk(req.params.id)
  );
  if (err) return res.config("查询失败，请重试");

  if (req.auth.roleType === 2 && currentBlog.userId !== req.auth.id) {
    return res.config("权限不足，请联系管理员");
  }

  // 处理博客内容中的多媒体文件
  let matchs = currentBlog.content.match(pathReg4Remove)
    ? currentBlog.content.match(pathReg4Remove)
    : [];

  // 去重
  matchs = Array.from(new Set(matchs));

  // 删除博客中包含的多媒体文件
  batchProcessBlogFils4Remove(matchs, (err) => {
    if (err) return res.config(err.message);
  });

  // 删除博客封面
  // 删除封面
  const coverPath = path.join(
    __dirname,
    "../upload",
    currentBlog.cover ? currentBlog.cover : ""
  );
  const isFile = fs.lstatSync(coverPath).isFile();
  if (isFile) {
    fs.unlinkSync(coverPath);
  }

  const [error, result] = await awaitWrap(currentBlog.destroy());
  if (error) return res.config(error.message);
  res.config("删除成功!", 0, result);
};

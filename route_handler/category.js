// 导入数据库模型对象
const models = require("../database/models");
const Op = models.Sequelize.Op;
// 导入数据读取写入组件
const fs = require("fs");
// 导入路径操作对象
const path = require("path");
const { Sequelize } = require("../database/models");

const { configCover, awaitWrap } = require("../utils/Tools");

// 获取所有分类
exports.getAllCategories = async (req, res) => {
  const where = {
    categoryType: 0,
    userId: {
      [Op.ne]: null,
    },
  };

  // 从数据库中查询所有的分类
  const categoies = await models.Category.findAll({
    attributes: [
      "id",
      "cover",
      "sort",
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
      [Sequelize.literal(`(SELECT id FROM Blogs limit 1)`), "firstBlogId"],
    ],
    where,
    order: [["sort", "ASC"]],
  });
  res.config("获取分类信息成功", 0, categoies);
};

// 新增分类
exports.addCategory = async (req, res) => {
  // 获取用户 id
  const userInfo = req.auth;

  // 操作封面的文件名,如果存在，将图片移动到永久保存目录
  configCover(req.body.cover, async (err, imgName) => {
    if (err) return res.config(err.message);
    // 从数据库中查询出排序最后一条分类信息
    const categoies = await models.Category.findAll({
      where: {
        userId: {
          [Op.ne]: null,
        },
        categoryType: 0,
      },
      order: [["sort", "DESC"]],
      limit: 1,
    });

    const lastCategory = categoies.length > 0 ? categoies[0].toJSON() : null;

    const category = {
      ...req.body,
      cover: imgName,
      categoryType: 0,
      sort: lastCategory ? lastCategory.sort + 1 : 1,
      userId: userInfo.id,
      nickName: userInfo.nickName,
    };
    const ins = await models.Category.create(category);
    res.config("添加分类成功", 0, ins);
  });
};

// 修改分类
exports.updateCategory = (req, res) => {
  // 判断权限，超级管理员和管理员可以删除所有分类
  // 普通用户只能删除自己的分类
  if (req.auth.roleType === 2 && req.body.userId !== req.auth.id) {
    return res.config("权限不够，请联系管理员");
  }

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

// 删除分类
exports.deleteCategory = async (req, res) => {
  if (req.params.id === 1) return res.config("当前分类是系统所有,不允许删除");

  // 先查询该分类下是否有博客，如果博客数量不为0，禁止删除
  const blogCountResult = await models.Blog.findOne({
    attributes: [
      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM Blogs WHERE Blogs.categoryId = ${req.params.id})`
        ),
        "blogCount",
      ],
    ],
  });

  if (blogCountResult !== null && blogCountResult.toJSON().blogCount > 0) {
    return res.config("当前分类中博客不为空，请清空后再进行删除");
  }

  let currentCategory = await models.Category.findByPk(req.params.id);

  if (req.auth.roleType === 2 && currentCategory.userId !== req.auth.id) {
    return res.config("权限不够，请联系管理员");
  }

  const resultObj = currentCategory.toJSON();
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
  // 更新排序字段
  let sortResult = await models.Category.findAll({
    where: {
      userId: req.auth.id,
      categoryType: 0,
      sort: { [Op.gte]: resultObj.sort },
    },
  });

  if (sortResult) {
    for (let i = 0; i < sortResult.length; i++) {
      sortResult[i].sort -= 1;
      await sortResult[i].save();
    }
  }

  currentCategory = await currentCategory.destroy();
  res.config("删除成功", 0, currentCategory);
};

// 排序操作
exports.sortCategory = async (req, res) => {
  const result = await models.Category.bulkCreate(req.body, {
    validate: true,
    updateOnDuplicate: ["sort"],
  });
  res.config("重新排序成功", 0, result);
};

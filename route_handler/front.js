const models = require('../database/models')
const Sequelize = models.Sequelize
const { awaitWrap } = require('../utils/Tools')
const NeedModule = require('../utils/NodeTree')

// 获取博客列表，分页
exports.getAllBlogs = async (req, res) => { 
  // 当前页数
  const pageNo = parseInt(req.query.pageNo) || 1;
  // 每页显示数量
  const pageSize = parseInt(req.query.pageSize) || 15;

  const where = {
    delType: 0,
    blogType: 0
  }

  if (req.query.categoryId) {
    where.categoryId = req.query.categoryId
  }

  const [error, result] = await awaitWrap(models.Blog.findAndCountAll({
    where,
    order: [["id", "DESC"]],
    offset: (pageNo - 1) * pageSize,
    limit: pageSize,
  }))

  if (error) return res.config(error.message)

  const data = {
    totalCount: result.count,
    list: result.rows,
    pageNo: pageNo,
    pageSize: pageSize,
  }
  res.config('获取博客列表成功', 0, data)
}

// 获取分类列表，默认所有
exports.getAllCategory = async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || null
  const [error, result] = await awaitWrap(models.Category.findAll({
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
        "blogCount"
      ],
      [Sequelize.literal(`(SELECT id FROM Blogs limit 1)`), "firstBlogId"],
    ],
    where: {
      id: {
        [Sequelize.Op.ne]: 1,
      },
      categoryType: 0
    },
    limit: pageSize
  }))
  if(error) return res.config(error.message)
  res.config('获取分类列表成功', 0, result)
}

// 获取专题列表，分页
exports.getSpecials = async (req, res) => { 
  const pageNo = parseInt(req.query.pageNo) || 1
  const pageSize = parseInt(req.query.pageSize) || 20

  const [error, result] = await awaitWrap(models.Category.findAndCountAll({
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
    where: {
      id: {
        [Sequelize.Op.ne]: 1,
      },
      categoryType: 1
    },
    offset: (pageNo - 1) * pageSize,
    limit: pageSize
  }))
  if (error) return res.config(error.message)
  const data = {
    totalCount: result.count,
    pageNo: pageNo,
    pageSize: pageSize,
    list: result.rows
  }
  res.config('专题列表获取成功', 0, data)
}

// 获取专题详情
exports.getSpecialDetail = async (req, res) => { 
  console.log(req.params)
  // 获取主题信息组装根节点
  let special = await models.Category.findOne({
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
      "blogCount"
    ],
      [Sequelize.literal(`(SELECT id FROM Blogs limit 1)`), "firstBlogId"]
    ],
    where: {
      id: req.params.specialId
    }
  });
  if (!special) return res.config("查询成功", 0); // 查询不到主题分类

  special = special.toJSON()

  // 执行递归查询
  const node = new NeedModule(req.params.specialId);
  const nodeTree = await node.getNeedsTree();
  special.blogs = nodeTree;
  res.config("查询成功", 0, special);
}

// 获取用户列表
exports.getUsers = async (req, res) => { 
  const pageSize = parseInt(req.query.pageSize) || null
  const [error, result] = await awaitWrap(models.User.findAll({
    attributes: [
      'id', 'nickName', 'avatar', 'phone', 'profession', 'introduction', 'lastLoginTime',
      [Sequelize.literal(
        `(SELECT COUNT(*) FROM Blogs WHERE Blogs.userId = User.id)`
      ),
      "blogCount"]
    ],
    where: {
      status: 1
    },
    limit: pageSize
  }))
  if (error) return res.config(error.message)
  res.config('ok', 0, result)
}

// 获取博客详情
exports.getBlog = async (req, res) => { 
  console.log(req.query)
  const [error, result] = await awaitWrap(models.Blog.findByPk(req.query.blogId))
  if (error) return res.config(error.message)
  res.config('获取博客详情成功', 0, result)
}

// 获取分类详情
exports.getCategoryDetail = async (req, res) => { 
  const categoryId = req.params.categoryId
  if(!categoryId) return res.config('请传入分类id')
  const [error, result] = await awaitWrap(models.Category.findOne({
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
        "blogCount"
      ],
      [Sequelize.literal(`(SELECT id FROM Blogs limit 1)`), "firstBlogId"],
    ],
    where: {
      id: categoryId
    }
  }))
  if(error) return res.config(error.message)
  res.config('ok', 0, result)
}

// 获取系统设置信息
exports.getSysInfo = async (req, res) => { 
  const [error, result] = await awaitWrap(models.Setting.findOne())
  if(error) res.config(error.message)
  res.config('获取系统设置成功', 0, result)
}
// 专题路由模块
const express = require("express");
const router = express.Router();
const expressJoi = require("@escook/express-joi");

// 路由实现模块
const special_handler = require("../route_handler/special");
// 验证规则
const {
  add_special_schema,
  update_special_schema,
  delete_special_schema,
  get_special_blogs_schema,
  auto_save_special_blog_schema,
  delete_special_blog_schema,
} = require("../schemas/special");

// 新增专题
router.post("/", expressJoi(add_special_schema), special_handler.addNewSpecial);

// 删除专题
router.delete(
  "/:id",
  expressJoi(delete_special_schema),
  special_handler.deleteSpecial
);

// 修改专题
router.put(
  "/",
  expressJoi(update_special_schema),
  special_handler.updateSpecial
);

// 获取专题列表
router.get("/", special_handler.getAllSpecials);

// 根据id获取单条专题
router.get("/:specialId", special_handler.getSpecialById);

// 专题下的博客新增
router.post(
  "/blog",
  expressJoi(auto_save_special_blog_schema),
  special_handler.addNewBlog
);

// 专题下的博客自动保存
router.post(
  "/blog/autoSave",
  expressJoi(auto_save_special_blog_schema),
  special_handler.autoSave
);

// 标记删除博客
router.delete(
  "/blog/:id",
  expressJoi(delete_special_blog_schema),
  special_handler.blogMarkDelete
);

// 专题下的博客排序
router.put("/blog/sort", special_handler.specialBlogSort);

// 获取专题下的文章列表,多叉树结构
router.get(
  "/blogs/:categoryId",
  expressJoi(get_special_blogs_schema),
  special_handler.getAllSpecialBlogList
);

module.exports = router;

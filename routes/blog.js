// 引入 express
const express = require("express");
// 创建路由对象
const router = express.Router();

// 导入验证数据的中间件
const expressJoi = require("@escook/express-joi");

// 导入规则组件
const {
  add_or_update_blog_schema,
  auto_save_blog_schema,
  remove_or_restore_schma,
  id_required_schema,
} = require("../schemas/blog");

// 引入路由实现对象
const blog_handler = require("../route_handler/blog");

// 获取所有博客列表
router.get("/", blog_handler.getAllBlogs);

// 新增博客
router.post(
  "/",
  expressJoi(add_or_update_blog_schema),
  blog_handler.upinsertBlog
);

// 获取已标记删除的博客
router.get("/delBlogs", blog_handler.getDelBlogs);

// 获取博客详情
router.get("/:id", expressJoi(id_required_schema), blog_handler.getBlogById);

// 自动保存
router.post(
  "/autoSave",
  expressJoi(auto_save_blog_schema),
  blog_handler.autoSave
);

// 标记删除或者恢复
router.put(
  "/:id",
  expressJoi(remove_or_restore_schma),
  blog_handler.updateBolgDelType
);

// 删除博客
router.delete("/:id", expressJoi(id_required_schema), blog_handler.deleteBlog);



// 导出路由对象
module.exports = router;

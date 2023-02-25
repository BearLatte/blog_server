const express = require("express");
const router = express.Router();

// 导入验证数据的中间件
const expressJoi = require("@escook/express-joi");

// 导入接口处理组件
const category_handler = require("../route_handler/category");

// 导入验证规则模块
const {
  add_category_schema,
  update_category_schema,
  delete_category_schema,
} = require("../schemas/category");

// 获取所有分类接口
router.get("/", category_handler.getAllCategories);

// 新增分类接口
router.post("/", expressJoi(add_category_schema), category_handler.addCategory);

// 修改分类接口
router.put(
  "/",
  expressJoi(update_category_schema),
  category_handler.updateCategory
);

// 删除分类
router.delete(
  "/:id",
  expressJoi(delete_category_schema),
  category_handler.deleteCategory
);

// 排序操作
router.put("/sort", category_handler.sortCategory);

module.exports = router;

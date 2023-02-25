const express = require("express");
const router = express.Router();
const expressJoi = require("@escook/express-joi");

// 规则组件
const {
  update_user_info,
  modify_current_password_schema,
  update_or_add_user_schema,
  change_status_schema,
  change_password_schema,
} = require("../schemas/user");

// 导入用户路由处理组件
const user_handler = require("../route_handler/user");

// 获取当前用户信息接口
router.get("/current", user_handler.getUserInfo);

// 修改当前用户信息
router.put(
  "/current",
  expressJoi(update_user_info),
  user_handler.updateCurrentUserInfo
);

// 获取所有用户信息接口
router.get("/list", user_handler.getUserList);

// 新增或修改用户
router.post(
  "/",
  expressJoi(update_or_add_user_schema),
  user_handler.upsertUser
);

// 修改用户权限
router.put(
  "/changeStatus",
  expressJoi(change_status_schema),
  user_handler.changeUserStatus
);

// 删除用户
router.delete("/:userId", user_handler.delteUser);

// 修改用户密码, 不传id表示修改当前登录用户
router.put(
  "/changePassword",
  expressJoi(change_password_schema),
  user_handler.modifyPassword
);

module.exports = router;

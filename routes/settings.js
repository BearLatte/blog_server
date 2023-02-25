const { Router } = require("express");

const router = Router();

const setting_handler = require("../route_handler/settings");

// 获取系统设置
router.get("/", setting_handler.getSystemSettings);

// 更改系统设置
router.put("/", setting_handler.updateSystemSettings);

// 创建zip文件
// router.get('/createZip', setting_handler.createZip)

module.exports = router;

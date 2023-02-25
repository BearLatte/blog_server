// 用于处理文件上传的组件模块
const express = require("express");
const router = express.Router();

const upload_file_handler = require("../route_handler/file");

// 上传文件接口
router.post("/upload", upload_file_handler.upload);

module.exports = router;

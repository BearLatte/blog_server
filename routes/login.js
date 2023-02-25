// 导入 express 创建路由实例
const express = require('express')
// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 创建路由对象
const router = express.Router()

// 导入函数实现模块
const login_handler = require('../route_handler/login')
// 导入验证规则模块
const { reg_login_schema } = require('../schemas/login')

// 获取验证码
router.get('/checkCode', login_handler.getCheckCode)
// 登录
router.post('/login', expressJoi(reg_login_schema), login_handler.login)

module.exports = router
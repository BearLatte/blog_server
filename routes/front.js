const { Router } = require('express')
const router = Router()
const front_handler = require('../route_handler/front')

// 获取博客列表
router.get('/blogs', front_handler.getAllBlogs)

// 获取系统设置内容
router.get('/getSysInfo', front_handler.getSysInfo)

// 获取分类列表
router.get('/categories', front_handler.getAllCategory)

// 获取专题列表
router.get('/specials', front_handler.getSpecials)

// 获取专题详情
router.get('/specials/:specialId', front_handler.getSpecialDetail)

// 获取用户列表
router.get('/users', front_handler.getUsers)

// 根据id获取博客详情
router.get('/blogDetail', front_handler.getBlog)

// 根据id获取分类详情
router.get('/categories/:categoryId', front_handler.getCategoryDetail)

module.exports = router
// 导入验证码生成组件
const svgCaptcha = require('svg-captcha-fixed')

// 生成一个验证码对象
module.exports.captcha = () => {
  return svgCaptcha.create({
    fontSize: 40,
    size: 6,                              // 验证码长度
    ignoreChars: 'o01il',                 // 忽略字符
    color: true,                          // 是否彩色
    noise: Math.floor(Math.random() * 5), // 干扰线条数
    width: 130,                           // 图形宽度
    height: 30,                           // 图形高度
    background: '#cc9966'                 // 图像背景颜色
  })
}
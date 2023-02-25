// 导入规则制定组件
const joi = require("joi");

// 执行登录表单验证规则
const account = joi.string().min(2).max(15).required();
const password = joi.string().required();
const checkCode = joi.string().required();

exports.reg_login_schema = {
  body: {
    account,
    password,
    checkCode,
  },
};

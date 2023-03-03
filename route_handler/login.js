// 导入验证码生成组件
const { captcha } = require("../utils/Captcha");
// 导入数据库模型对象
const models = require("../database/models");
// 导入解密工具
const { rsaPrivateDecrypt } = require("../utils/PasswordCryptTool");
// 导入生成 token 的库
const jwt = require("jsonwebtoken");
// 导入全局配置组件
const global = require("../global");

// 获取验证码的验证的逻辑
exports.getCheckCode = (request, response) => {
  // 生成验证码
  const cap = captcha();
  request.session.captcha = cap.text;
  response.type("svg").send(cap.data);
};

// 登录的逻辑实现
exports.login = async (requst, response) => {
  if (requst.session.captcha === undefined)
    return response.config("验证码过期，请重新获取!");
  if (
    requst.session.captcha.toLowerCase() !== requst.body.checkCode.toLowerCase()
  )
    return response.config("验证码不正确,请检查后重新输入!");

  const user = await models.User.findOne({
    where: {
      account: requst.body.account,
    },
  });

  if (!user || user.status === 0) {
    return response.config("用户不存在!");
  }

  if (user.status === 0)
    return response.config("该用户已经被禁用，请联系管理员");

  const clientPwd = rsaPrivateDecrypt(requst.body.password);
  const localPwd = rsaPrivateDecrypt(user.password);

  if (clientPwd === localPwd) {
    // 更新数据库中的最后登录时间字段
    user.update({ lastLoginTime: new Date() });
    const tokenParams = {
      id: user.id,
      account: user.account,
      phone: user.phone,
      nickName: user.nickName,
      roleType: user.roleType,
    };
    // 在服务器端生成 token 字符串
    const token = jwt.sign(tokenParams, global.jwtTokenSecret, {
      expiresIn: global.expiresIn,
    });
    // 返回数据给客户端
    response.config("登录成功!", 0, "Bearer " + token);
  } else {
    console.log("客户端密码", clientPwd, "本地密码：", localPwd);
    response.config("账号或密码不正确");
  }
};

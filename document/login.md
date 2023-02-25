# 登录模块

#### 登录路由的定制

- 分别在`routes route_handler shcemas`目录下新增`login.js`文件
- 新增`/checkCode`接口用于获取图形验证码

```javascript
// ./utils/captcha.js
// 导入验证码生成组件
const svgCaptcha = require("svg-captcha-fixed");

// 生成一个验证码对象
module.exports.captcha = () => {
  return svgCaptcha.create({
    size: 6, // 验证码长度
    ignoreChars: "o01il", // 忽略字符
    color: true, // 是否彩色
    noise: Math.floor(Math.random() * 5), // 干扰线条数
    width: 150, // 图形宽度
    height: 50, // 图形高度
    background: "#cc9966", // 图像背景颜色
  });
};
```

```javascript
// ./schemas/login.js
// 导入规则制定组件
const joi = require("joi");

// 执行登录表单验证规则
const account = joi.string().alphanum().min(1).max(15).required();
const password = joi
  .string()
  .pattern(/^[\S]{6,15}$/)
  .required();
const checkCode = joi.string().min(6).max(6).required();

exports.reg_login_schema = {
  body: {
    account,
    password,
    checkCode,
  },
};
```

```javascript
// ./routes/login.js
// 导入 express 创建路由实例
const express = require("express");
// 导入验证数据的中间件
const expressJoi = require("@escook/express-joi");
// 创建路由对象
const router = express.Router();
// 导入函数实现模块
const login_handler = require("../route_handler/login");
// 获取验证码
router.get("/checkCode", login_handler.getCheckCode);
// 暴露 router 对象给外界使用
module.exports = router;
```

```javascript
// ./route_handler/login.js
// 导入验证码生成组件
const { captcha } = require("../utils/captcha");
// 获取验证码的验证的逻辑
exports.getCheckCode = (request, response) => {
  // 生成验证码
  const code = captcha();
  if (code.text && code.data) {
    // 验证码生成成功后将图片返回给客户端
    // 将字符串验证码挂载到请求对象中，便于登录时做验证
    request.checkCode = code.text;

    // 返回成功内容
    // response.type('svg').send(code.data)
    response.json({
      status: 0,
      message: "验证码生成成功!",
      data: code.data,
    });
  }
  response.config("验证码生成失败!");
};
```

- 新增密码加解密工具，采用 `RSA` 非对称加密，私钥客户端保存，公钥服务器保存

```javascript
// GenerateKey.js
// 生成公钥私钥工具
const { generateKeyPairSync } = require("crypto");
// 导入文件操作模块
const fs = require("fs");
// 导入路径处理模块
const path = require("path");

// 生成密钥对
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// 将密钥对写入本地
fs.writeFile(
  path.join(__dirname, "PublicKey.pem"),
  publicKey,
  "utf-8",
  (error) => {
    if (error) {
      return console.log("写入失败:" + error.message);
    }
    console.log("写入成功");
  }
);

fs.writeFile(
  path.join(__dirname, "PrivateKey.pem"),
  privateKey,
  "utf-8",
  (error) => {
    if (error) {
      return console.log("写入失败:" + error.message);
    }
    console.log("写入成功");
  }
);
```

- 新增工具密码加解密 `PasswordCryptTool.js`

```javascript
// 导入加解密组件
const { publicEncrypt, privateDecrypt } = require("crypto");
// 导入fs模块
const fs = require("fs");
// 导入路径处理组件
const path = require("path");

// 使用公钥加密方法
module.exports.encryptWithPublicKey = (preencodeData, handler) => {
  fs.readFile(path.join(__dirname, "PublicKey.pem"), (err, data) => {
    if (err) {
      return handler(err, null);
    }
    const pub = data.toString("ascii");
    const encryptedString = publicEncrypt(
      pub,
      Buffer.from(preencodeData)
    ).toString("base64");
    handler(null, encryptedString);
  });
};

// 使用私钥解密方法
module.exports.decryptWithPrivateKey = (predecodeData, handler) => {
  fs.readFile(path.join(__dirname, "PrivateKey.pem"), (err, data) => {
    if (err) {
      return handler(err, null);
    }
    const pri = data.toString("ascii");
    const decryptedString = privateDecrypt(
      pri,
      Buffer.from(predecodeData.toString("base64"), "base64")
    ).toString();
    handler(null, decryptedString);
  });
};
```

#### session 处理

- 终端运行`npm install express-session`安装`session`中间件,在`app.js`中添加如下代码，用以配置`session`;

```javascript
// session 组件，处理 cookie
const session = require("express-session");

// 配置 session 全局中间件
app.use(
  session({
    resave: true,
    secret: "iBlog",
    rolling: true,
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: true,
  })
);
```

#### 封装全局返回处理中间件

```javascript
// 封装全局返回处理中间件
app.use((req, res, next) => {
  // status 默认值为 1，表示失败的情况
  // infomation 的值可能是个错误对象，也可能是描述字符串
  res.config = function (infomation, status = 1, data = null) {
    return res.json({
      status: status,
      data: data,
      refreshToken: req.session.refreshToken,
      message: infomation instanceof Error ? infomation.message : infomation,
    });
  };
  next();
});
```

#### 关于 token 的操作

- 终端运行`npm install jsonwebtoken express-jwt`安装所需组件；
- 在登录成功后生成`token`, 返回给客户端；

```javascript
// 在服务器端生成 token 字符串
const token = jwt.sign(tokenParams, global.jwtTokenSecret, {
  expiresIn: global.expiresIn,
});
// 返回数据给客户端
response.config("登录成功!", 0, "Bearer " + token);
```
- `token`续期，在`app.js`中使用以下代码;
```javascript
// 导入 token 生成组件
const jwt = require("jsonwebtoken");
// 导入 token 解析组件
const { expressjwt } = require("express-jwt");
// 导入全局静态变量
const global = require("./global");

// 在路由之前注册解析 token 的中间件，否则不起作用
app.use(
  expressjwt({
    secret: global.jwtTokenSecret,
    algorithms: ["HS256"],
  }).unless({ path: [/^\/api\/auth/, /^\/images/] })
);

// token 续期操作
app.use((req, _, next) => {
  // 将包含鉴权的路由忽略掉
  if (
    req.path.indexOf("/api/auth") !== -1 ||
    req.path.indexOf("/images") !== -1
  )
    return next();
  // 判断剩余时间是否大于30分钟，如果小于30分钟
  // 重新生成一个2小时有效期的 token 放入到 req.session.refreshToken 中
  const isRenew = req.auth.exp - new Date().getTime() / 1000 < 60 * 30;
  console.log("token 是否要续期=====" + isRenew);
  if (isRenew) {
    console.log("token 准备续期");
    let payload = { ...req.auth, iat: null, exp: null };
    payload = Object.keys(payload)
      .filter((key) => payload[key] !== null && payload[key] !== undefined)
      .reduce((acc, key) => ({ ...acc, [key]: payload[key] }), {});
    const token =
      "Bearer " +
      jwt.sign(payload, global.jwtTokenSecret, { expiresIn: global.expiresIn });
    req.session.refreshToken = token;
    return next();
  } else {
    req.session.refreshToken = null;
    return next();
  }
});
```



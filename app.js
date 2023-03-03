const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
// 表单验证规则对象
const Joi = require("joi");
// session 组件，处理 cookie
const session = require("express-session");
// 导入 token 生成组件
const jwt = require("jsonwebtoken");
// 导入 token 解析组件
const { expressjwt } = require("express-jwt");
// 导入压缩资源组件
const compression = require('compression')

// 导入全局静态变量
const global = require("./global");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "upload")));
app.use("/files/tmp", express.static("/tmp"));

app.use(compression())

// 定义 session 全局中间件
app.use(
  session({
    resave: true,
    secret: "iBlog",
    rolling: true,
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: true,
  })
);

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

// 在路由之前注册解析 token 的中间件，否则不起作用
app.use(
  expressjwt({
    secret: global.jwtTokenSecret,
    algorithms: ["HS256"],
  }).unless({ path: [/^\/api\/auth/, /^\/files/, /^\/api\/front/] })
);

// token 续期操作
app.use((req, _, next) => {
  // 将包含鉴权的路由忽略掉
  if (req.path.indexOf("/api/auth") != -1 || req.path.indexOf("/files") !== -1 || req.path.indexOf('/api/front') != -1)
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

// 文件上传路由
const fileRouter = require("./routes/file");
app.use("/api/file", fileRouter);

// 导入登录路由模块
const loginRouter = require("./routes/login");
app.use("/api/auth", loginRouter);

// 导入用户信息处理模块
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);

// 导入博客分类路由
const categoryRouter = require("./routes/category");
app.use("/api/category", categoryRouter);

// 导入博客管理路由
const blogRuter = require("./routes/blog");
app.use("/api/blog", blogRuter);

// 导入专题管理路由
const specialRouter = require("./routes/special");
app.use("/api/special", specialRouter);

// 导入系统设置路由
const settingsRouter = require("./routes/settings");
app.use("/api/settings", settingsRouter);

const front = require('./routes/front')
app.use('/api/front', front)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  // 不符合验证规则导致的错误
  if (err instanceof Joi.ValidationError) {
    return res.config(err.message);
  }
  // 处理 token 过期的逻辑
  if (err.name === "UnauthorizedError") return res.config("身份认证失败!", 401);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

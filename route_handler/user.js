// 导入数据库模型对象
const models = require("../database/models");
const { pathReg4Remove } = require("../global");
const {
  configAvatar,
  awaitWrap,
  batchProcessBlogFils4Remove,
} = require("../utils/Tools");
const { passwordReg } = require("../global");
const Op = require("sequelize").Op;
// 导入路径操作组件
const path = require("path");
const fs = require("fs");

// 解密组件
const {
  rsaPrivateDecrypt,
  rsaPublicEncrypt,
} = require("../utils/PasswordCryptTool");

// 获取用户信息，如果有id就查id，如果没有id就查自己
exports.getUserInfo = async (request, response) => {
  request.params.id = request.auth.id;
  getUser(request, response);
};

// 获取所有用户列表,不包括当前用户
exports.getUserList = async (req, res) => {
  const pageNo = parseInt(req.query.pageNo) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const where = {
    id: { [Op.ne]: req.auth.id },
    roleType: { [Op.ne]: 0 },
  };

  if (req.query.nickName) {
    where.nickName = { [Op.like]: "%" + req.query.nickName + "%" };
  }

  if (req.query.phone) {
    where.phone = { [Op.like]: "%" + req.query.phone + "%" };
  }

  if (req.auth.roleType !== 0) {
    where.status = { [Op.ne]: 0 };
  }

  const [err, result] = await awaitWrap(
    models.User.findAndCountAll({
      attributes: [
        "id",
        "account",
        "avatar",
        "nickName",
        "phone",
        "profession",
        "editorType",
        "editorTypeName",
        "roleType",
        "roleTypeName",
        "status",
        "statusName",
        "createdAt",
        "lastLoginTime",
        "introduction",
      ],
      where,
      offset: (pageNo - 1) * pageSize,
      limit: pageSize,
    })
  );
  if (err) return res.config(err.message);
  const data = {
    totalCount: result.count,
    list: result.rows,
    pageNo: pageNo,
    pageSize: pageSize,
  };
  res.config("获取用户列表成功", 0, data);
};

// 更新当前用户个人信息
exports.updateCurrentUserInfo = async (req, res) => {
  req.body.id = req.auth.id;
  updateUserInfo(req, res);
};

// 修改当前用户密码
exports.modifyPassword = async (req, res) => {
  console.log(req.body);
  const plainPwd = rsaPrivateDecrypt(req.body.password);
  if (!passwordReg.test(plainPwd)) {
    return res.config("密码验证不通过，至少包含字母、数字、特殊字符，6-15位");
  }
  const [error, result] = await awaitWrap(
    models.User.update(
      { password: req.body.password },
      {
        where: {
          id: req.body.id ? req.body.id : req.auth.id,
        },
      }
    )
  );
  if (error) return res.config(error.message);
  res.config("修改成功", 0);
};

// 新增或修改用户信息
exports.upsertUser = async (req, res) => {
  console.log(req.body);

  // 判断是新增还是更改
  if (req.body.id) {
    // id 值不为空，修改
    updateUserInfo(req, res);
  } else {
    // id 值为空，新增
    const [findErr, result] = await awaitWrap(
      models.User.findOne({
        where: { account: req.body.account },
      })
    );

    // 查询用户失败
    if (findErr) return res.config(findErr.message);
    // 用户已存在
    if (result) return res.config("账号已存在");

    // 组装信息
    const obj = { ...req.body };
    obj.roleTypeName = obj.roleType === 2 ? "普通用户" : "管理员";
    obj.editorTypeName = obj.editorType === 0 ? "markdown" : "富文本";
    obj.status = 1;
    obj.statusName = "启用";
    obj.password = rsaPublicEncrypt("888888");
    configAvatar(obj.avatar, async (avatarErr, avatarPath) => {
      if (avatarErr) return res.config(avatarErr.message);
      obj.avatar = avatarPath ? avatarPath : "/avatars/avatar.jpg";
      const [createErr, result] = await awaitWrap(models.User.create(obj));
      if (createErr) return res.config(createErr.message);
      res.config("创建用户成功!", 0, { ...result, password: null });
    });
  }

  // res.config("ok", 0);
};

// 修改用户权限
exports.changeUserStatus = async (req, res) => {
  const userId = req.body.id;
  const obj = {
    status: req.body.status,
  };

  if (req.body.status === 0) {
    obj.statusName = "已删除";
  } else if (req.body.status === 1) {
    obj.statusName = "启用";
  } else {
    obj.statusName = "禁用";
  }

  const [err, _] = await awaitWrap(
    models.User.update(obj, {
      where: {
        id: userId,
      },
    })
  );

  if (err) return res.config(err.message);
  res.config("更新成功!", 0);
};

// 删除用户，永久删除
exports.delteUser = async (req, res) => {
  console.log(req.params);
  // 查询用户所有分类
  let [error, result] = await awaitWrap(
    models.Category.findAll({
      where: {
        userId: req.params.userId,
      },
    })
  );
  if (error) return res.config(error.message);

  // 遍历删除分类
  if (result && result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      const cate = result[i];
      const coverPath = path.join(
        __dirname,
        "../upload",
        cate.cover ? cate.cover : ""
      );
      const isFile = fs.lstatSync(coverPath).isFile();
      if (isFile) {
        fs.unlinkSync(coverPath);
      }
      await cate.destroy();
    }
  }

  // 查询当前用户所有博客
  [error, result] = await awaitWrap(
    models.Blog.findAll({
      where: {
        userId: req.params.userId,
      },
    })
  );

  if (error) return res.config(error.message);

  // 遍历删除所有博客
  if (result && result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      const blog = result[i];

      // 处理博客内容中的多媒体文件
      let matchs = blog.content.match(pathReg4Remove)
        ? blog.content.match(pathReg4Remove)
        : [];

      // 去重
      matchs = Array.from(new Set(matchs));

      // 删除博客中包含的多媒体文件
      batchProcessBlogFils4Remove(matchs, (err) => {
        if (err) return res.config(err.message);
      });

      const coverPath = path.join(
        __dirname,
        "../upload",
        blog.cover ? blog.cover : ""
      );
      const isFile = fs.lstatSync(coverPath).isFile();
      if (isFile) {
        fs.unlinkSync(coverPath);
      }
      await blog.destroy();
    }
  }

  // 最后删除用户
  [error, result] = await awaitWrap(models.User.findByPk(req.params.userId));
  if (error) return res.config(error.message);

  // 删除用户头像
  if (result.avatar !== "/avatars/avatar.jpg") {
    const avatarPath = path.join(__dirname, "../upload", result.avatar);
    if (fs.lstatSync(avatarPath).isFile()) {
      fs.unlinkSync(avatarPath);
    }
  }

  [error, result] = await awaitWrap(result.destroy());
  res.config("删除成功用户成功！", 0, result);
};

// 更新用户信息
const updateUserInfo = (req, res) => {
  console.log(req.body);
  // 处理头像
  configAvatar(req.body.avatar, async (configAvatarErr, avatarPath) => {
    if (configAvatarErr) return res.config(configAvatarErr.message);

    // 获取当前用户
    const [findErr, currentUser] = await awaitWrap(
      models.User.findByPk(req.body.id)
    );

    if (findErr) return res.config(findErr.message);
    // 配置信息
    currentUser.nickName = req.body.nickName;
    currentUser.phone = req.body.phone;
    currentUser.profession = req.body.profession;
    currentUser.editorType = req.body.editorType;
    currentUser.editorTypeName =
      req.body.editorType === 0 ? "markdown" : "富文本";
    currentUser.introduction = req.body.introduction;
    currentUser.roleType = req.body.roleType;
    currentUser.roleTypeName = req.body.roleType === 1 ? "管理员" : "普通用户";

    // 处理旧的头像
    if (
      currentUser.avatar !== "/avatars/avatar.jpg" &&
      currentUser.avatar !== avatarPath
    ) {
      // 删除旧的头像
      const oldAvatar = currentUser.toJSON().avatar;
      const oldPath = path.join(
        __dirname,
        "../upload",
        oldAvatar ? oldAvatar : ""
      );
      if (fs.lstatSync(oldPath).isFile()) {
        fs.unlinkSync(oldPath);
      }
    }
    currentUser.avatar = avatarPath;
    const [error, result] = await awaitWrap(currentUser.save());
    if (error) return res.config(error.message);
    res.config("更新成功", 0, result);
  });
};

// 获取用户信息
const getUser = async (req, res) => {
  // 1. 从数据库查询用户信息
  let user = await models.User.findByPk(req.params.id);
  // 2. 返回给客户端用户信息
  //  2.1 判断用户信息是否完整
  if (!user) return res.config("查询失败");

  //  2.2 将取到的用户信息去掉密码
  user = { ...user.dataValues, password: null };
  // 3. 将用户信息返回给客户端
  res.config("用户信息获取成功!", 0, user);
};

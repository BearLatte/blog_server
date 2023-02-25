# 博客分类模块

#### 建表

- 终端执行`sequelize model:generate --name Category --attributes cover:string,categoryName:string,categoryDesc:text,categoryType:integer,userId:string,nickName:string,sort:integer`;
- 终端执行`sequelize db:migrate --env development` 执行迁移;
- 终端执行`sequelize seed:generate --name category` 创建种子文件;
- 修改完种子文件，终端执行`sequelize db:seed --seed 20230129151419-category`将种子文件写入到数据库中。

#### 提供接口

- 分别在`routes`、`route_handler`和`schemas`目录下新建`category.js`文件；
- `schemas/category.js`:

  ```javascript
  // 导入表单规则制定组件
  const joi = require("joi");

  // 定义表单验证规则
  const id = joi.number().required();
  const cover = joi.string();
  const categoryName = joi.string().min(1).required();
  const categoryDesc = joi.string().min(1).required();

  exports.add_category_schema = {
    body: {
      cover,
      categoryName,
      categoryDesc,
    },
  };

  exports.update_category_schema = {
    body: {
      id,
      cover,
      categoryName,
      categoryDesc,
    },
  };
  ```

- `routes/category.js`:

  ```javascript
  const express = require("express");
  const router = express.Router();

  // 导入验证数据的中间件
  const expressJoi = require("@escook/express-joi");

  // 导入接口处理组件
  const category_handler = require("../route_handler/category");

  // 导入验证规则模块
  const {
    add_category_schema,
    update_category_schema,
  } = require("../schemas/category");
  const { route } = require("./login");

  // 获取所有分类接口
  router.get("/", category_handler.getAllCategories);

  // 新增分类接口
  router.post(
    "/",
    expressJoi(add_category_schema),
    category_handler.addCategory
  );

  // 修改分类接口
  router.put(
    "/",
    expressJoi(update_category_schema),
    category_handler.updateCategory
  );

  // 删除分类
  router.delete("/:id", category_handler.deleteCategory);

  // 排序操作
  router.put("/sort", category_handler.sortCategory);

  module.exports = router;
  ```

- `route_handler/category.js`:

  ```javascript
  // 导入数据库模型对象
  const models = require("../database/models");
  // 导入数据读取写入组件
  const fs = require("fs");
  // 导入路径操作对象
  const path = require("path");

  // 获取所有分类
  exports.getAllCategories = async (req, res) => {
    // 获取用户 id
    const userId = req.auth.id;
    // 从数据库中查询所有的分类
    const categoies = await models.Category.findAll({
      where: {
        userId: userId,
      },
      order: [["sort", "ASC"]],
    });
    if (!categoies) return res.config("获取分类信息失败");
    res.config("获取分类信息成功", 0, categoies);
  };

  // 新增分类
  exports.addCategory = async (req, res) => {
    // 获取用户 id
    const userInfo = req.auth;
    // 操作封面的文件名,如果存在，将图片移动到永久保存目录
    let imgName = null;
    if (req.body.cover) {
      imgName = path.basename(req.body.cover);
      const sourcePath = `/tmp/${imgName}`;
      const destPath = path.join(__dirname, "../upload/covers", imgName);
      fs.rename(sourcePath, destPath, (error) => {
        if (error) return res.config("封面写入失败");
      });
    }

    // 从数据库中查询出排序最后一条分类信息
    const categoies = await models.Category.findAll({
      where: {
        userId: userInfo.id,
      },
      order: [["sort", "DESC"]],
      limit: 1,
    });
    const lastCategory = categoies.length > 0 ? categoies[0].toJSON() : null;
    const category = {
      ...req.body,
      cover: "/covers/" + imgName,
      categoryType: 0,
      sort: lastCategory ? lastCategory.sort + 1 : 1,
      userId: userInfo.id,
      nickName: userInfo.nickName,
    };
    const ins = await models.Category.create(category);
    res.config("添加分类成功", 0, ins);
  };

  // 修改分类
  exports.updateCategory = async (req, res) => {
    // 处理封面
    let imgName = req.body.cover;
    if (imgName.indexOf("tmp") !== -1) {
      imgName = path.basename(req.body.cover);
      const sourcePath = `/tmp/${imgName}`;
      const destPath = path.join(__dirname, "../upload/covers", imgName);
      fs.rename(sourcePath, destPath, (error) => {
        if (error) return res.config("封面写入失败");
      });
    }
    req.body.cover = "/covers/" + imgName;
    // 根据 id 查询要修改的分类
    const result = await models.Category.findByPk(req.body.id);
    // 删除旧的封面
    const oldCover = result.toJSON().cover;
    const coverPath = path.join(
      __dirname,
      "../upload/covers",
      oldCover ? oldCover : ""
    );
    if (fs.lstatSync(coverPath).isFile()) {
      fs.unlinkSync(coverPath);
    }
    // 更新信息
    result.update(req.body);
    res.config("修改成功", 0, result);
  };

  // 删除分类
  exports.deleteCategory = async (req, res) => {
    const result = await models.Category.findByPk(req.params.id);
    const resultObj = result.toJSON();
    // 删除封面
    const coverPath = path.join(
      __dirname,
      "../upload",
      resultObj.cover ? resultObj.cover : ""
    );
    const isFile = fs.lstatSync(coverPath).isFile();
    if (isFile) {
      fs.unlinkSync(coverPath);
    }
    result.destroy();
    res.config("删除成功", 0);
  };

  // 排序操作
  exports.sortCategory = async (req, res) => {
    const result = await models.Category.bulkCreate(req.body, {
      validate: true,
      updateOnDuplicate: ["sort"],
    });
    res.config("重新排序成功", 0, result);
  };
  ```

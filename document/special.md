# 博客分类模块

#### 建表

- 终端执行`sequelize model:generate --name Special --attributes cover:string,specialName:string,specialDesc:string,specialType:integer,userId:string,nickName:string`;
- 终端执行`sequelize db:migrate --env development` 执行迁移;
- 终端执行`sequelize seed:generate --name category` 创建种子文件;
- 修改完种子文件，终端执行`sequelize db:seed --seed 20230129151419-category`将种子文件写入到数据库中。

#### 提供接口

- 分别在`routes`、`route_handler`和`schemas`目录下新建`special.js`文件；
- `schemas/special.js`:

- `routes/special.js`:

- `route_handler/special.js`:

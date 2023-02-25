# 博客列表模块

#### 建表

- 终端执行`sequelize model:generate --name Blog --attributes userId:integer,nickName:string,cover:string,title:string,content:text,markdownContent:text,editorType:tinyint,editorTypeName:string,allowComment:tinyint,allowCommentTypeName:string,categoryId:integer,categoryName:string,publishStatus:tinyint,publishStatusName:string,sourceType:tinyint,sourceTypeName:string,reprintUri:string,summary:string,tag:string,blogType:tinyint,delType:tinyint,pBlogId:integer,sort:integer`;
- 终端执行`sequelize db:migrate --env development`执行迁移;
- 修改完种子文件，终端执行`sequelize db:seed --seed 种子名称`

#### 提供接口

- 在`schemas`、`rotes`和`route_handler`目录中创建名为`blog.js`的文件，用于接口返回；

# blog_server
i-Blog个人博客后台完整的项目，使用nodejs+express实现restful接口，该项目线上地址[i-Blog](https://www.i-blog.online)

# 安装方法
1. 首先在本地或远服务器上安装Mysql服务
2. 在根目录下 `npm i`
3. 修改数据库配置，root > database > config > config.json
    ```json
    {
      "development": {
        "username": "root",               // mysql 账户
        "password": "admin123",           // 密码
        "database": "blog_development",   // 数据库名称
        "host": "127.0.0.1",              // 数据库地址
        "dialect": "mysql",               
        "timezone":"+08:00"               // 设置时区
      },
      "production": {
        "username": "admin",
        "password": "Admin123.",
        "database": "i_Blog",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "timezone":"+08:00"
      }
    }
    ```
3. 终端执行`npx sequelize db:create --charset 'utf8mb4'`创建数据库
4. 终端执行`npx sequelize db:migrate` 创建所需表以及表结构
5. 终端执行`npx sequelize db:seed:all` 将所需种子插入到表中
6. 终端执行`npm run dev`，启动服务器，之后就可以通过设置的端口号访问本地服务了
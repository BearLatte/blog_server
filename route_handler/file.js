const formadiable = require("formidable");
// 文件上传处理组件模块，方法实现
exports.upload = (req, res) => {
  const form = new formadiable.IncomingForm({
    keepExtensions: true, // 是否保留文件原扩展名，默认为 false
    uploadDir: "/tmp",
    multiples: false, // 是否为多文件上传
    encoding: "utf-8", // 对象编码格式
  }); // 创建一个文件解析对象

  form.parse(req, (err, _, files) => {
    if (err) return res.config(err.message);
    res.config("上传成功", 0, files.file.filepath);
  });
};
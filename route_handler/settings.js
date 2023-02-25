const models = require("../database/models");
const { awaitWrap } = require("../utils/Tools");

exports.getSystemSettings = async (req, res) => {
  const [error, result] = await awaitWrap(models.Setting.findOne());
  if (error) return res.config(error.message);
  res.config("获取成功", 0, result);
};

exports.updateSystemSettings = async (req, res) => {
  console.log(req.body);
  const [error, result] = await awaitWrap(
    models.Setting.update(req.body, { where: { id: 1 } })
  );
  if (error) return res.config(error.message);
  res.config("保存成功", 0, result);
};

// 将静态页面打包到/tmp目录下
exports.createZip = (req, res) => {
  
};

// 导入表单规则制定组件
const joi = require("joi");

// 定义表单验证规则
const id = joi
  .number()
  .required()
  .error(new joi.ValidationError("id 参数为必传"));
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

exports.delete_category_schema = {
  params: {
    id,
  },
};

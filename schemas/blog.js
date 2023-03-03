// 导入表单规则制定组件
const joi = require("joi");

// 定义表单验证规则
const id = joi.number();
const title = joi
  .string()
  .required()
  .error(new joi.ValidationError("博客标题为必填项"));
const cover = joi.string();
const categoryId = joi
  .number()
  .min(1)
  .required()
  .error(new joi.ValidationError("分类id是必传的"));
const sourceType = joi.number().required();
const tag = joi.string().empty([null, ""]).default("");
const allowComment = joi.number().required();
const summary = joi.string().max(255).error(new joi.ValidationError('字符数超限，长度为0~255个中文或英文字母'));
const content = joi.string();
const markdownContent = joi.string().empty([null, ""]).default("");
const editorType = joi.number().required();
const reprintUri = joi.string();

const autoSaveCateId = joi.number().empty([null]).default(1);
const autoSaveSourceType = joi.number();
const autoSaveAllowComment = joi.number();

exports.add_or_update_blog_schema = {
  body: {
    id,
    title,
    editorType,
    content,
    markdownContent,
    tag,
    categoryId,
    allowComment,
    cover,
    summary,
    reprintUri,
    sourceType,
    userId: joi.number().empty([null]),
    nickName: joi.string().empty([null]),
  },
};

exports.auto_save_blog_schema = {
  body: {
    id,
    title,
    editorType,
    content,
    markdownContent,
    tag,
    categoryId: autoSaveCateId,
    allowComment: autoSaveAllowComment,
    cover,
    summary,
    reprintUri,
    sourceType: autoSaveSourceType,
    userId: joi.number().empty([null]),
    nickName: joi.string().empty([null]),
  },
};

// 移动博客到回收站
exports.remove_or_restore_schma = {
  params: {
    id: joi
      .number()
      .required()
      .error(new joi.ValidationError("博客id不能为空")),
  },
  body: {
    delType: joi
      .number()
      .required()
      .error(new joi.ValidationError("delType值不能为空")),
  },
};

// id 必须
exports.id_required_schema = {
  params: {
    id: joi
      .number()
      .required()
      .error(new joi.ValidationError("文章id不能为空")),
  },
};

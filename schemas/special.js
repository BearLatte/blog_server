// 导入表单规则制定组件
const joi = require("joi");

const id = joi
  .number()
  .required()
  .error(new joi.ValidationError("id为必传参数"));
const cover = joi.string();
const categoryName = joi
  .string()
  .required()
  .error(new joi.ValidationError("专题名称为必传参数"));
const categoryDesc = joi
  .string()
  .required()
  .error(new joi.ValidationError("专题描述为必传参数"));
const sort = joi
  .number()
  .required()
  .error(new joi.ValidationError("排序参数为必传参数"));
const categoryType = joi.number().empty([null]).default(1);

exports.add_special_schema = {
  cover,
  categoryName,
  categoryDesc,
  categoryType,
};

exports.update_special_schema = {
  id,
  cover,
  categoryName,
  categoryDesc,
  categoryType,
};

exports.delete_special_schema = {
  params: {
    id,
  },
};

exports.get_special_blogs_schema = {
  params: {
    categoryId: joi
      .number()
      .required()
      .error(new joi.ValidationError("分类id为必传参数")),
  },
};

exports.auto_save_special_blog_schema = {
  body: {
    id: joi.number(),
    sort: joi.number(),
    userId: joi.number(),
    nickName: joi.string(),
    content: joi.string(),
    allowComment: joi.number().empty([null]).default(1),
    allowCommentTypeName: joi.string().default("允许"),
    markdownContent: joi.string().empty([null, ""]).default(""),
    editorType: joi.number(),
    pBlogId: joi.number().empty([null]).default(null),
    categoryName: joi.string(),
    publishStatus: joi.number().empty([null]).default(0),
    publishStatusName: joi.string().default("草稿"),
    sourceType: joi.number().empty([null]).default(0),
    sourceTypeName: joi.string().default("原创"),
    reprintUri: joi.string(),
    summary: joi.string(),
    delType: joi.number(),
    cover: joi.string(),
    title: joi
      .string()
      .required()
      .error(new joi.ValidationError("博客标题为必传项")),
    categoryId: joi
      .number()
      .required()
      .error(new joi.ValidationError("专题分类id为必传项")),
  },
};

exports.add_new_special_blog_schema = {
  body: {
    id: joi.number(),
    sort: joi.number(),
    userId: joi.number(),
    nickName: joi.string(),
    content: joi.string(),
    allowComment: joi.number().empty([null]).default(1),
    allowCommentTypeName: joi.string().default("允许"),
    markdownContent: joi.string().empty([null, ""]).default(""),
    editorType: joi.number(),
    pBlogId: joi.number().empty([null]).default(null),
    categoryName: joi.string(),
    publishStatus: joi.number().empty([null]).default(1),
    publishStatusName: joi.string().default("已发布"),
    sourceType: joi.number().empty([null]).default(0),
    sourceTypeName: joi.string().default("原创"),
    reprintUri: joi.string(),
    summary: joi.string(),
    delType: joi.number(),
    cover: joi.string(),
    title: joi
      .string()
      .required()
      .error(new joi.ValidationError("博客标题为必传项")),
    categoryId: joi
      .number()
      .required()
      .error(new joi.ValidationError("专题分类id为必传项")),
  },
};

exports.delete_special_blog_schema = {
  params: {
    id,
  },
};

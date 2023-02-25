const joi = require("joi");

const nickName = joi
  .string()
  .min(2)
  .max(15)
  .required()
  .error(new joi.ValidationError("昵称规则为长度2~15个字符，必传"));
const avatar = joi.string().empty([null]).default("/avatars/avatar.jpg");
const phone = joi
  .string()
  .regex(
    /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
  )
  .error(new joi.ValidationError("手机号格式错误"));
const editorType = joi
  .number()
  .required()
  .error(new joi.ValidationError("editorType是必传项"));
const profession = joi.string();
const introduction = joi.string();
const editorTypeName = joi.string();
const status = joi
  .number()
  .required()
  .error(new joi.ValidationError("状态值status为必传项"));

exports.update_user_info = {
  body: {
    nickName,
    avatar,
    phone,
    roleType: joi.number(),
    editorType,
    profession,
    introduction,
  },
};

exports.modify_current_password_schema = {
  body: {
    password: joi
      .string()
      .required()
      .error(new joi.ValidationError("参数错误，密码为加密后的必传项")),
  },
};

exports.update_or_add_user_schema = {
  body: {
    id: joi.number().allow(null),
    account: joi.string(),
    nickName: nickName,
    avatar: avatar,
    phone: phone,
    editorType: editorType,
    profession: profession,
    introduction: introduction,
    editorTypeName: editorTypeName,
    roleType: joi
      .number()
      .required()
      .error(new joi.ValidationError("必须设置用户的角色")),
  },
};

exports.change_status_schema = {
  body: {
    id: joi
      .number()
      .required()
      .error(new joi.ValidationError("用户id为必传项")),
    status,
  },
};

exports.change_password_schema = {
  body: {
    id: joi.number().empty([null]),
    password: joi
      .string()
      .required()
      .error(new joi.ValidationError("密码字段是必传项")),
  },
};

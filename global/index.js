module.exports = {
  // 加密和解密token的密钥
  jwtTokenSecret: "iBlog is a good blog ^ ^ ",
  // Token 的有效期，10个小时
  expiresIn: 3600 * 24 * 3,
  // 匹配博客内容中多媒体文件正则,用于新增博客
  pathReg4Add:
    /\/files\/tmp\/[a-zA-Z0-9]+.(png|jpe?g|gif|bmp|psd|tiff|tga|eps|swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)/g,
  // 匹配博客内容中多媒体文件正则,用于删除博客
  pathReg4Remove:
    /\/files\/blogFiles\/[a-zA-Z0-9]+.(png|jpe?g|gif|bmp|psd|tiff|tga|eps|swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)/g,
  // 密码正则表达式, 至少包含字母、数字、特殊字符，6-15位
  passwordReg: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\da-zA-Z\s]).{6,15}$/,
};

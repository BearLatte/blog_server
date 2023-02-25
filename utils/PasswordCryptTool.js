// 导入加解密组件
const crypto = require("crypto");
// 导入fs模块
const fs = require("fs");
// 导入路径处理组件
const path = require("path");

// RSA 公钥加密
module.exports.rsaPublicEncrypt = (message) => {
  const key = fs.readFileSync(path.join(__dirname, "PublicKey.pem"));
  const crypted = crypto.publicEncrypt(
    {
      key: key,
      passphrase: "top secret",
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(message, "utf8")
  );
  return crypted.toString("base64");
};

// 使用私钥解密方法
module.exports.rsaPrivateDecrypt = (message) => {
  const key = fs.readFileSync(path.join(__dirname, "PrivateKey.pem"));
  const decrypted = crypto
    .privateDecrypt(
      {
        key: key,
        passphrase: "top secret",
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(message.toString("base64"), "base64")
    )
    .toString();
  return decrypted;
};

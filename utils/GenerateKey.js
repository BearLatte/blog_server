// 生成公钥私钥工具
const { generateKeyPairSync } = require('crypto')
// 导入文件操作模块
const fs = require('fs')
// 导入路径处理模块
const path = require('path')

// 生成密钥对
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret'
  }
})

// 将密钥对写入本地
fs.writeFile(path.join(__dirname, 'PublicKey.pem'), publicKey, 'utf-8', (error) => {
  if (error) {
    return console.log('写入失败:' + error.message)
  }
  console.log('写入成功')
})

fs.writeFile(path.join(__dirname, 'PrivateKey.pem'), privateKey, 'utf-8', (error) => {
  if (error) {
    return console.log('写入失败:' + error.message)
  }
  console.log('写入成功')
})
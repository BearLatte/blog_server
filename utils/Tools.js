// 导入路径操作组件
const path = require("path");
// 导入文件操作组件
const fsPromises = require("fs").promises;

// 处理封面路径
exports.configCover = async (coverPath, callback) => {
  if (!coverPath) return callback(null, null);
  if (coverPath.indexOf("tmp") === -1) return callback(null, coverPath);

  const imageName = path.basename(coverPath);
  const sourcePath = `/tmp/${imageName}`;
  const destPath = path.join(__dirname, "../upload/covers", imageName);
  const [err, _] = await this.awaitWrap(
    fsPromises.rename(sourcePath, destPath)
  );
  return callback(err, `/covers/${imageName}`);
};

// 处理头像图片
exports.configAvatar = async (avatarPath, callback) => {
  if (!avatarPath) return callback(null, null);
  if (avatarPath.indexOf("tmp") === -1) return callback(null, avatarPath);

  const imageName = path.basename(avatarPath);
  const sourcePath = `/tmp/${imageName}`;
  const destPath = path.join(__dirname, "../upload/avatars", imageName);
  const [err, _] = await this.awaitWrap(
    fsPromises.rename(sourcePath, destPath)
  );
  return callback(err, `/avatars/${imageName}`);
};

// 替换博客内容
exports.repalceBlogContent = (content) => {
  if (!content) return content;
  // html 正则
  const htmlReg = /src="\/files\/tmp/g;
  // markdown 正则
  const markdownReg = /\(\/files\/tmp/g;
  content = content.replace(markdownReg, "(/files/blogFiles");
  content = content.replace(htmlReg, 'src="/files/blogFiles');
  return content;
};

// 遍历路径，批量重命名到另一个路径下
exports.batchProcessBlogFile4Add = async (matchs, callback) => {
  if (!matchs) return callback(null);
  for (let i = 0; i < matchs.length; i++) {
    const matchPath = matchs[i];
    const fileName = path.basename(matchPath);
    const sourcePath = `/tmp/${fileName}`;
    const destPath = path.join(__dirname, "../upload/blogFiles", fileName);
    const [err, result] = await this.awaitWrap(
      fsPromises.rename(sourcePath, destPath)
    );
    callback(err);
    console.log("批量处理博客图片的返回值", result);
  }
};

// 批量删除博客内容多媒体文件
exports.batchProcessBlogFils4Remove = async (matchs, callback) => {
  console.log("有没有进到这个方法中", matchs);
  if (!matchs || matchs.length === 0) return callback(null);
  console.log("要执行下面的步骤", matchs);
  for (let i = 0; i < matchs.length; i++) {
    const matchPath = matchs[i];
    const fileName = path.basename(matchPath);
    const filePath = path.join(__dirname, "../upload/blogFiles", fileName);
    const [err, result] = await this.awaitWrap(fsPromises.lstat(filePath));
    if (result.isFile()) {
      const [err, result] = await this.awaitWrap(fsPromises.unlink(filePath));
      console.log("删除完成================", err, result);
      callback(err, result);
    }
  }
};

exports.trimString = (str) => {
  if (typeof str === "string") {
    return str.trim();
  } else {
    return str;
  }
};

exports.awaitWrap = (promise) => {
  return promise.then((data) => [null, data]).catch((err) => [err, null]);
};

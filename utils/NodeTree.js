const models = require('../database/models')

// 实现递归查询的类
class NeedModule {
  constructor(id) {
    this.id = id;
  }

  // 根据主题id查询树
  async getNeedsTree() {
    let rootNeeds = await models.Blog.findAll({
      where: {
        categoryId: this.id,
        pBlogId: null,
        delType: 0,
      },
      order: [["sort", "ASC"]],
    });
    rootNeeds = await this.getChildNeeds(rootNeeds);
    return rootNeeds;
  }

  // 从叶节点查询树
  async getRootNode() {
    let rootNode = await models.Blog.findAll({
      where: {
        id: this.id,
      },
    });
    rootNode = await this.getChildNeeds(rootNode);
    return rootNode;
  }

  async getChildNeeds(rootNeeds) {
    console.log(rootNeeds);
    let expendPromise = [];
    rootNeeds.forEach(async (item) => {
      expendPromise.push(
        models.Blog.findAll({
          where: {
            pBlogId: item.id,
            delType: 0,
          },
          order: [["sort", "ASC"]],
        })
      );
    });
    let children = await Promise.all(expendPromise);
    for (let [idx, item] of children.entries()) {
      if (item.length > 0) {
        item = await this.getChildNeeds(item);
      }
      rootNeeds[idx].dataValues.children = item;
    }
    return rootNeeds;
  }
}

module.exports = NeedModule

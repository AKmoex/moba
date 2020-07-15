module.exports = (options) => {
  return async (req, res, next) => {
    const modelName = require("inflection").classify(req.params.resource);
    //const Model = require(`../../models/${modelName}`);
    //不能是const，若是const则后面访问不到，应当挂载到req上
    req.Model = require(`../models/${modelName}`);
    next();
  };
};

const controller = require('./index');
const categoryService = require('../services/category.service');

//get comment by postId
const getCategory = async (req, res, next) => {
  const resService = await categoryService.getCategory(req);
  if (resService.statusCode === 200) {
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  }
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const updateCategory = async (req, res, next) => {
  const resService = await categoryService.updateCategory(req.body);
  if (resService.statusCode === 200) {
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  }
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const createCategory = async (req, res, next) => {
  const resService = await categoryService.createCategory(req.body);
  if (resService.statusCode === 200) {
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  }
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

module.exports = {
  getCategory,
  updateCategory,
  createCategory,
};

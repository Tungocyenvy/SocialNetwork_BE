const controller = require('./index');
const categoryService = require('../services/category.service');

const getCategory = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await categoryService.getCategory(req, lang);
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

const updateCategory= async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await categoryService.updateCategory(req.body, lang);
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
  const lang = req.headers['accept-language'];
  const resService = await categoryService.createCategory(req, lang);
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
  // getCategoryGroup,
  // updateCategoryGroup,
  // createCategoryGroup,
  // getCategoryReport,
  // updateCategoryReport,
  // createCategoryReport,
  // getCategoryPost,
  // createCategoryPost,
  // updateCategoryPost,
  getCategory,
  createCategory,
  updateCategory
};

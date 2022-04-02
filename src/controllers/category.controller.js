const controller = require('./index');
const categoryService = require('../services/category.service');

//GROUP
const getCategoryGroup = async (req, res, next) => {
  const resService = await categoryService.getCategoryGroup(req);
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

const updateCategoryGroup = async (req, res, next) => {
  const resService = await categoryService.updateCategoryGroup(req.body);
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

const createCategoryGroup = async (req, res, next) => {
  const resService = await categoryService.createCategoryGroup(req.body);
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

//REPORT
const getCategoryReport = async (req, res, next) => {
  const resService = await categoryService.getCategoryReport(req);
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

const updateCategoryReport = async (req, res, next) => {
  const resService = await categoryService.updateCategoryReport(req.body);
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

const createCategoryReport = async (req, res, next) => {
  const resService = await categoryService.createCategoryReport(req.body);
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
  getCategoryGroup,
  updateCategoryGroup,
  createCategoryGroup,
  getCategoryReport,
  updateCategoryReport,
  createCategoryReport,
};

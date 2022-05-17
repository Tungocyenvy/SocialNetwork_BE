const controller = require('./index');
const searchService = require('../services/search.service');

const searchUser = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await searchService.searchUser(req, lang);
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

const searchGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await searchService.searchGroup(req, lang);
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

const searchUserForSubGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await searchService.searchUserForSubGroup(req, lang);
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

const searchUserForMainGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await searchService.searchUserForMainGroup(req, lang);
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

const searchCompany = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await searchService.searcCompany(req, lang);
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
  searchUser,
  searchGroup,
  searchUserForSubGroup,
  searchUserForMainGroup,
  searchCompany
};

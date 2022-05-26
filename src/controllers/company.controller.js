const controller = require('./index');
const companyService = require('../services/company.service');

const signup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.signup(req,lang);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const createPost = async (req, res, next) => {
  const companyId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await companyService.createPost(companyId, req.body, lang);
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

const getDetailPost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.getDetailPost(req, lang);
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

const deletePost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.deletePost(req, lang);
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

const updatePost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.updatePost(req.body, lang);
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

const getPostByCompanyId = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const companyId = req.value.body.token.data;
  const resService = await companyService.getPostByCompanyId(companyId,req, lang);
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

const getListPost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.getListPost(req, lang);
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

const getListPostSameCompany = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.getListPostSameCompany(req, lang);
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
  signup,
  createPost,
  updatePost,
  deletePost,
  getDetailPost,
  getPostByCompanyId,
  getListPost,
  getListPostSameCompany
};

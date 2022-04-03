const controller = require('./index');
const reportService = require('../services/report.service');

//GROUP
const getReportGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.getReportGroup(req, lang);
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

const createReportGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.createReportGroup(req.body, lang);
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

//PORT
const getReportPost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.getReportPost(req, lang);
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

const createReportPost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.createReportPost(req.body, lang);
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
  getReportGroup,
  createReportGroup,
  getReportPost,
  createReportPost,
};

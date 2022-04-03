const controller = require('./index');
const reportService = require('../services/report.service');
/**CREATE */
//GROUP
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
/**GET FOR MANAGER */
const getReportAllGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.getReportAllGroup(req, lang);
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

const getReportAllPost = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await reportService.getReportAllPost(req, lang);
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
  createReportGroup,
  createReportPost,
  getReportAllGroup,
  getReportAllPost,
};

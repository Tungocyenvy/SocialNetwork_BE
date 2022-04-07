const controller = require('./index');
const notificationService = require('../services/notification.service');

const createTemplate = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await notificationService.createTemplate(req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const getTemplate = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await notificationService.getTemplate(lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const updateTemplate = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await notificationService.updateTemplate(req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const deleteTemplate = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await notificationService.deleteTemplate(req, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const createNotify = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await notificationService.createNotify(req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  createNotify,
};

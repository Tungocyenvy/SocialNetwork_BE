const controller = require('./index');
const messageService = require('../services/message.Service');

const getMessage = async (req, res, next) => {
  const resService = await messageService.getMessage(req, req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

module.exports = { getMessage };

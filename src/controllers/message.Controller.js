const controller = require('./index');
const messageService = require('../services/message.Service');

const getMessage = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const resService = await messageService.getMessage(req, req.body, userId);
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

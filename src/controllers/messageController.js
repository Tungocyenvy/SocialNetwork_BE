const controller = require('./index');
const messageService = require('../services/messageService');

const createMessage = async (req, res, next) => {
  console.log(
    '🚀 ~ file: messageController.js ~ line 5 ~ createMessage ~ req',
    req.body,
  );

  const resService = await messageService.createMessage(req.body);
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
  createMessage,
};

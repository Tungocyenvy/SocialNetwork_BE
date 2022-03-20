const controller = require('./index');
const conversationService = require('../services/conversation.Service');

const createConversation = async (req, res, next) => {
  const resService = await conversationService.createConversation(req.body);
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
  createConversation,
};

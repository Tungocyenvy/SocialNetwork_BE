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

const updateConversation = async (req, res, next) => {
  const resService = await conversationService.updateConversation(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const getListConversation = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const resService = await conversationService.getListConversation(userId, req);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const getConversation = async (req, res, next) => {
  const userOne = req.query.id1;
  const userTwo = req.query.id2;
  const resService = await conversationService.getConversation(
    userOne,
    userTwo,
  );
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
  updateConversation,
  getListConversation,
  getConversation,
};

const controller = require('./index');
const conversationService = require('../services/conversation.service');

const createConversation = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await conversationService.createConversation(
    req.body,
    lang,
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

const updateConversation = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await conversationService.updateConversation(
    req.body,
    lang,
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

const getListConversation = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const userId = req.value.body.token.data;
  const resService = await conversationService.getListConversation(
    userId,
    req,
    lang,
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

const getConversation = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const userOne = req.query.id1;
  const userTwo = req.query.id2;
  const resService = await conversationService.getConversation(
    userOne,
    userTwo,
    lang,
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

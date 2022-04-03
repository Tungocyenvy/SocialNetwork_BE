const controller = require('./index');
const commentService = require('../services/comment.service');

//get comment by postId
const getComment = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  // const postId = req.params.postId;
  const resService = await commentService.getComment(req, lang);
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

const createComment = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.createComment(userId, req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const updateComment = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.updateComment(userId, req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const deleteComment = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.deleteComment(userId, req, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const getReply = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await commentService.getReply(req, lang);
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

const updateReply = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.updateReply(userId, req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const replyComment = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.replyComment(userId, req.body, lang);

  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const deleteReply = async (req, res, next) => {
  const userId = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await commentService.deleteReply(userId, req, lang);

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
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getReply,
  replyComment,
  updateReply,
  deleteReply,
};

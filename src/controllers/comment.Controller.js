const controller = require('./index');
const commentService = require('../services/comment.Service');

//get comment by postId
const getComment = async (req, res, next) => {
  const postId = req.params.postId;
  const resService = await commentService.getComment({ postId });
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
  const token = req.value.body.token.data;
  const resService = await commentService.createComment(
    { userId: token },
    req.body,
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

const replyComment = async (req, res, next) => {
  const token = req.value.body.token.data;
  const resService = await commentService.replyComment(
    { userId: token },
    req.body,
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

const updateComment = async (req, res, next) => {
  const token = req.value.body.token.data;
  const resService = await commentService.updateComment(
    { userId: token },
    req.body,
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

const updateReply = async (req, res, next) => {
  const token = req.value.body.token.data;
  const resService = await commentService.updateReply(
    { userId: token },
    req.body,
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

const deleteComment = async (req, res, next) => {
  const token = req.value.body.token.data;
  const idComment = req.params.id;
  //console.log(idComment);
  const resService = await commentService.deleteComment(
    { userId: token },
    idComment,
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

const deleteReply = async (req, res, next) => {
  const token = req.value.body.token.data;
  const idCmt = req.params.idCmt;
  const idRl = req.params.idRl;
  const resService = await commentService.deleteReply(
    { userId: token },
    idCmt,
    idRl,
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
  getComment,
  createComment,
  replyComment,
  updateComment,
  updateReply,
  deleteComment,
  deleteReply,
};

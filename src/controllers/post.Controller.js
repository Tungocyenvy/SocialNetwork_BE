const controller = require('./index');
const postService = require('../services/post.service');

const createPost = async (req, res, next) => {
  const userID = req.value.body.token.data;
  const resService = await postService.createPost(userID, req.body);
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

const getDetailPost = async (req, res, next) => {
  const postId = req.params.postId;
  const resService = await postService.getDetailPost(postId);
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

//for maingroup
const getListPostByUserId = async (req, res, next) => {
  const userID = req.value.body.token.data;
  const resService = await postService.getListPostByUserId(userID, req);
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

//for subgroup
const getListPostByGroupId = async (req, res, next) => {
  const resService = await postService.getListPostByGroupId(req);
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
  createPost,
  getDetailPost,
  getListPostByUserId,
  getListPostByGroupId,
};

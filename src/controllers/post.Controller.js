const controller = require('./index');
const postService = require('../services/post.Service');

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

module.exports = {
  createPost,
};

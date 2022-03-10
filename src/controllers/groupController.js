const controller = require('./index');
const groupService = require('../services/groupService');

//get comment by postId
const addUser = async (req, res, next) => {
  const resService = await groupService.addUser(req.body);
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
  addUser,
};

const controller = require('./index');
const accountService = require('../services/accountService');

const signin = async (req, res, next) => {
  const resService = await accountService.SigninService(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const forgotPass = async (req, res, next) => {
  const resService = await accountService.forgotPassword(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const changePassword = async (req, res, next) => {
  const tokenID = req.value.body.token.data;
  const resService = await accountService.changePassword(tokenID, req.body);
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

const getProfile = async (req, res, next) => {
  const token = req.value.body.token.data;
  const resService = await accountService.getProfile({
    AccountId: token,
  });
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

const updateProfile = async (req, res, next) => {
  // const TokenID = req.value.body.token?.data;
  // const { token, ...data } = req.value.body;
  const token = req.value.body.token.data;
  console.log(req.body);
  const resService = await accountService.updateProfile(token, req.body);
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
  signin,
  forgotPass,
  changePassword,
  getProfile,
  updateProfile,
};

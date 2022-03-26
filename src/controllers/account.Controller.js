const controller = require('./index');
const accountService = require('../services/account.Service');

//ACCOUNT
const signin = async (req, res, next) => {
  const resService = await accountService.signinService(req.body);
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

const resetPassword = async (req, res, next) => {
  const resService = await accountService.resetPassword(req.body);
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

const signup = async (req, res, next) => {
  const resService = await accountService.signup(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const deleteAccount = async (req, res, next) => {
  const resService = await accountService.deleteAccount(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const recoveryAccount = async (req, res, next) => {
  const resService = await accountService.recoveryAccount(req.body);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const searchUser = async (req, res, next) => {
  const resService = await accountService.searchUser(req);
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
  resetPassword,
  getProfile,
  updateProfile,
  signup,
  deleteAccount,
  recoveryAccount,
  searchUser,
  changePassword,
};

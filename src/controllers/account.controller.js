const controller = require('./index');
const accountService = require('../services/account.service');

//ACCOUNT
const signin = async (req, res, next) => {
  const resService = await accountService.signinService(req);
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
  const resService = await accountService.forgotPassword(req);
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
  const resService = await accountService.resetPassword(req);
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
  const userID = req.value.body.token.data;
  const resService = await accountService.changePassword(userID, req);
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
  const AccountId = req.value.body.token.data;
  const resService = await accountService.getProfile(AccountId,req);
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
  const AccountId = req.value.body.token.data;
  const resService = await accountService.updateProfile(AccountId, req);
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
  const resService = await accountService.signup(req);
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
  const resService = await accountService.deleteAccount(req);
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
  const resService = await accountService.recoveryAccount(req);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const getListAccount = async (req, res, next) => {
  const resService = await accountService.getListAccount(req);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const verifyPhoneNumber = async (req, res, next) => {
  const resService = await accountService.verifyPhoneNumber(req);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const checkAdminSG = async (req, res, next) => {
  const userID = req.value.body.token.data;
  const resService = await accountService.checkAdminSG(userID,req);
  if (resService.statusCode === 200 || resService.statusCode === 201)
    return controller.sendSuccess(
      res,
      resService.data,
      resService.statusCode,
      resService.msg,
    );
  return controller.sendSuccess(res, {}, resService.statusCode, resService.msg);
};

const addAOC = async (req, res, next) => {
  const userID = req.value.body.token.data;
  const resService = await accountService.addAOC(userID,req);
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
  signin,
  forgotPass,
  resetPassword,
  getProfile,
  updateProfile,
  signup,
  deleteAccount,
  recoveryAccount,
  changePassword,
  getListAccount,
  verifyPhoneNumber,
  checkAdminSG,
  addAOC
};

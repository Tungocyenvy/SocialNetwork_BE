const controller = require('./index');
const groupService = require('../services/group.service');

//get comment by postId
const addUser = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.addUser(req.body, lang);
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

//sendNotifyForMaingroup
const sendNotifyForMainGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.sendNotifyForMainGroup(req.body, lang);
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

//deleteUser
const deleteUser = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.deleteUser(req.body, lang);
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

//deleteUser
const deleteListUser = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.deleteListUser(req.body, lang);
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

//getListFaculty
const getListFaculty = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.getListFaculty(req, lang);
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

const createFaculty = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.createFaculty(req.body, lang);
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

const updateFaculty = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.updateFaculty(req.body, lang);
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

const tranferFaculty = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.tranferFaculty(req.body, lang);
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

const changeAdmin = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.changeAdmin(req.body, lang);
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

const createSubgroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const userId = req.value.body.token.data;
  const resService = await groupService.createSubGroup(userId, req.body, lang);
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

const getRelativeGroup = async (req, res, next) => {
  const UserID = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await groupService.getRelativeGroup(UserID, req, lang);
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

const getAllGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.getAllGroup(req, lang);
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

const updateGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.updateGroup(req.body, lang);
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

const getListUser = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.getListUser(req, lang);
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

const getGroupByUserId = async (req, res, next) => {
  const UserID = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await groupService.getGroupByUserId(UserID, req, lang);
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

const getDetailGroup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await groupService.getDetailGroup(req, lang);
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

const checkAdminforSub = async (req, res, next) => {
  const UserID = req.value.body.token.data;
  const lang = req.headers['accept-language'];
  const resService = await groupService.checkAdminforSub(UserID,req, lang);
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
  sendNotifyForMainGroup,
  deleteUser,
  deleteListUser,
  getListFaculty,
  tranferFaculty,
  createFaculty,
  changeAdmin,
  createSubgroup,
  getRelativeGroup,
  getAllGroup,
  updateGroup,
  updateFaculty,
  getListUser,
  getGroupByUserId,
  getDetailGroup,
  checkAdminforSub
};

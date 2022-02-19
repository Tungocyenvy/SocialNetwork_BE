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

module.exports = {
  signin,
};

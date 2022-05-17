const controller = require('./index');
const companyService = require('../services/company.service');

const signup = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await companyService.signup(req,lang);
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
  signup,
};

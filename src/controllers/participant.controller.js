const controller = require('./index');
const participantService = require('../services/participant.service');

const addParticipant = async (req, res, next) => {
  const lang = req.headers['accept-language'];
  const resService = await participantService.addParticipant(req.body, lang);

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
  addParticipant,
};

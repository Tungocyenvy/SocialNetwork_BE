const controller = require('./index');
const participantService = require('../services/participant.service');

const addParticipant = async (req, res, next) => {
  const resService = await participantService.addParticipant(req.body);

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

const participant = require('../models/participant.model');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('participant'));
};

const addParticipant = async (data, lang) => {
  const msg = getMsg(lang);
  try {
    const res = await participant.insertMany(data, {
      ordered: true,
    });
    return {
      msg: msg.addParticipant,
      statusCode: 200,
      data: res,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  addParticipant,
};

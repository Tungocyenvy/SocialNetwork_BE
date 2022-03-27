const participant = require('../models/participant.model');

const addParticipant = async (data) => {
  try {
    const res = await participant.insertMany(data, {
      ordered: true,
    });
    return {
      msg: 'add participants successfully',
      statusCode: 200,
      data: res,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during adding participants',
      statusCode: 300,
    };
  }
};

module.exports = {
  addParticipant,
};

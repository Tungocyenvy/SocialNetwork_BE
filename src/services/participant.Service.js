const participant = require('../models/participant.Model');

const addParticipant = async (data) => {
  try {
    const add = data.map(async (item) => {
      return participant.create(item);
    });
    await Promise.all(add);
    // if (res) {
    return {
      msg: 'add participants successfully',
      statusCode: 200,
      data: res,
    };
    // } else {
    //   return {
    //     msg: 'add participants failed',
    //     statusCode: 300,
    //   };
    // }
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

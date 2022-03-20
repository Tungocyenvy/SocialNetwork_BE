const message = require('../models/messageModel');

const createMessage = async (data) => {
  console.log(
    '🚀 ~ file: messageService.js ~ line 4 ~ createMessage ~ data',
    data,
  );
  try {
    const res = await message.create(data);
    if (res) {
      return {
        msg: 'add message successfully',
        statusCode: 200,
        data: res,
      };
    } else {
      return {
        msg: 'add message failed',
        statusCode: 300,
      };
    }
  } catch (err) {
    console.log(
      '🚀 ~ file: participantService.js ~ line 22 ~ addParticipant ~ err',
      err,
    );
    return {
      msg: 'An error occurred during creating message participants',
      statusCode: 300,
    };
  }
};

module.exports = {
  createMessage,
};

const Message = require('../models/message.Model');
const conversationService = require('./conversation.Service');

const createMessage = async (data) => {
  try {
    let isAuth = false;
    const userId = data.userId;
    delete data.userId;
    const res = await Message.create(data);
    if (res) {
      try {
        const stt = (await conversationService.updateConversation(data))
          .statusCode;
        if (stt === 3000) {
          return {
            msg: 'update message lastest failed',
            statusCode: 300,
          };
        }

        if (userId === data.senderId) isAuth = true;
        return {
          msg: 'add message & update message lastest successfully',
          statusCode: 200,
          data: { res, isAuth },
        };
      } catch (err) {
        return {
          msg: 'An error occurred during updating message lastest',
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: 'add message failed',
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during creating message participants',
      statusCode: 300,
    };
  }
};

module.exports = {
  createMessage,
};

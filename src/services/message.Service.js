const Message = require('../models/message.Model');
const conversationService = require('./conversation.Service');

const createMessage = async (data) => {
  try {
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
        return {
          msg: 'add message & update message lastest successfully',
          statusCode: 200,
          data: res,
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

const getMessage = async (req, body) => {
  let { conversationId } = body;
  let perPage = 7;
  let { page } = req.query || 1;
  try {
    //get top 7 lastest message
    const message = await Message.find({ conversationId: conversationId })
      .sort({ length: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage);

    console.log(message);

    return {
      msg: 'get message successfully',
      statusCode: 200,
      data: message.data,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during the get message process',
      statusCode: 300,
    };
  }
};

module.exports = {
  createMessage,
  getMessage,
};

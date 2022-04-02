const Message = require('../models/message.model');
const conversationService = require('./conversation.service');

const createMessage = async (data) => {
  try {
    if (data) {
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
    } else {
      return {
        msg: "Don't have data",
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

const getMessage = async (req, userId) => {
  let { conversationId } = req.query || {};
  let perPage = 15;
  let { page } = req.query || 1;
  try {
    let lstMessage = [];
    //get top 7 lastest message
    const total = await Message.countDocuments({
      conversationId: conversationId,
    });
    if (total > 0) {
      const message = await Message.find({
        conversationId: conversationId,
      })
        .sort({
          createdDate: -1,
        })
        .skip(perPage * page - perPage)
        .limit(perPage);

      message.reverse();
      lstMessage = message.map((x) => {
        var objMessage = {};
        objMessage.data = x.data;
        objMessage.isAuth = x.senderId === userId ? true : false;
        return objMessage;
      });
    }

    return {
      msg: 'get message successfully',
      statusCode: 200,
      data: {
        lstMessage,
        total,
      },
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
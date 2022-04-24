const Message = require('../models/message.model');
const conversationService = require('./conversation.service');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('message'));
};

const createMessage = async (data, lang) => {
  const msg = getMsg(lang);
  try {
    if (data) {
      const res = await Message.create(data);
      if (res) {
        try {
          const stt = (await conversationService.updateConversation(data))
            .statusCode;
          if (stt === 3000) {
            return {
              msg: msg.messageLastest,
              statusCode: 300,
            };
          }
          return {
            msg: msg.createMessage,
            statusCode: 200,
            data: res,
          };
        } catch (err) {
          return {
            msg: msg.messageLastest,
            statusCode: 300,
          };
        }
      } else {
        return {
          msg: msg.addFailed,
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getMessage = async (req, userId, lang) => {
  let { conversationId } = req.query || {};
  let perPage = 20;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    if(page>1)
    {
      perPage=10;
    }
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
        objMessage.data = x.data||{};
        objMessage.isAuth = x.senderId === userId ? true : false;
        return objMessage;
      });
    }

    return {
      msg: msg.getMessage,
      statusCode: 200,
      data: {
        lstMessage,
        total,
      },
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  createMessage,
  getMessage,
};

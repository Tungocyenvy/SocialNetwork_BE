const EVENT_MESSAGE_CSS = require('../events/client/message');
const EVENT_MESSAGE_SSC = require('../events/server/message');
const message = require('../../services/message.Service');
const conversation = require('../../services/conversation.Service');

function MessageHandler(socket) {
  const listens = {};
  listens[EVENT_MESSAGE_CSS.SEND_MESSAGE_CSS] = async (payload) => {
    //add message, update lastest message
    const res = await message.createMessage(payload);
    socket.to(payload.conversationId).emit(EVENT_MESSAGE_SSC.SEND_MESSAGE_SSC, {
      data: payload,
      msg: 'send mess room success',
      status: 200,
    });
  };

  listens[EVENT_MESSAGE_CSS.JOIN_ROOM_CSS] = async (payload) => {
    const res = (await conversation.createConversation(payload)).data || '';
    socket.join(res._id);
    socket.to(res._id).emit(EVENT_MESSAGE_SSC.JOIN_ROOM_SSC, {
      data: payload,
      msg: 'joined room success',
      status: 200,
    });
  };

  listens[EVENT_MESSAGE_CSS.LEAVE_ROOM_CSS] = (payload) => {
    socket.leave(payload.room);
    socket.to(payload.room).emit(EVENT_MESSAGE_SSC.LEAVE_ROOM_SSC, {
      data: null,
      msg: 'leave room success',
      status: 200,
    });
  };

  return listens;
}

module.exports = MessageHandler;

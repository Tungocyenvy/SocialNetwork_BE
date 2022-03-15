const EVENT_MESSAGE_CSS = require('../events/client/message');
const EVENT_MESSAGE_SSC = require('../events/server/message');

function MessageHandler(socket) {
  const listens = {};
  listens[EVENT_MESSAGE_CSS.SEND_MESSAGE_CSS] = (payload) => {
    console.log({
      room: payload.room,
      clientRoom: socket.adapter.rooms,
    });
    //add message, update lastest message
    socket.to(payload.room).emit(EVENT_MESSAGE_SSC.SEND_MESSAGE_SSC, {
      data: payload,
      msg: 'send mess room success',
      status: 200,
    });
  };

  listens[EVENT_MESSAGE_CSS.JOIN_ROOM_CSS] = (payload) => {
    console.log({
      payload,
    });

    socket.join(payload.room);
    socket.to(payload.room).emit(EVENT_MESSAGE_SSC.JOIN_ROOM_SSC, {
      data: null,
      msg: 'joined room success',
      status: 200,
    });
  };
  listens[EVENT_MESSAGE_CSS.LEAVE_ROOM_CSS] = (payload) => {
    console.log({
      payload,
    });
    socket.leave(payload.room);
    socket.to(payload.room).emit(EVENT_MESSAGE_SSC.LEAVE_ROOM_SSC, {
      data: null,
      msg: 'joined room success',
      status: 200,
    });
  };

  return listens;
}

module.exports = MessageHandler;

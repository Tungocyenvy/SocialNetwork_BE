const EVENT_NOTIFICATION_CSS = require('../events/client/notification');
const EVENT_NOTIFICATION_SSC = require('../events/server/notification');
const postService = require('../../services/post.service');
const commentService =require('../../services/comment.service');

function NotificationHandler(socket) {
  const listens = {};
  listens[EVENT_NOTIFICATION_CSS.SEND_NOTIFICATION_CSS] = async (payload) => {
    //add message, update lastest message
    socket.to(payload.userIds).emit(EVENT_NOTIFICATION_SSC.SEND_NOTIFICATION_SSC, {
      data: payload,
      msg: 'send notification room success',
      status: 200,
    });
  };

  listens[EVENT_NOTIFICATION_CSS.JOIN_ROOM_CSS] = async (payload) => {
    socket.join(payload._id);
    socket.to(payload._id).emit(EVENT_NOTIFICATION_SSC.JOIN_ROOM_SSC, {
      data: payload,
      msg: 'joined room success',
      status: 200,
    });
  };

  listens[EVENT_NOTIFICATION_CSS.LEAVE_ROOM_CSS] = (payload) => {
    socket.leave(payload._id);
    socket.to(payload._id).emit(EVENT_NOTIFICATION_SSC.LEAVE_ROOM_SSC, {
      data: null,
      msg: 'leave room success',
      status: 200,
    });
  };

  return listens;
}

module.exports = NotificationHandler;

const Profile = require('../../models/profile.model');
const message = require('../../services/message.service');
const EVENT_VIDEO_CHAT_SSC = require('../events/server/video-chat')
const EVENT_VIDEO_CHAT_CSS = require('../events/client/video-chat')


function VideoHandler(socket) {
  const listens = {};
  listens[EVENT_VIDEO_CHAT_CSS.ACCEPT_CALL_CSS] = async (payload) => {
    socket.to(`Channel_call_${payload.userId}`).emit(EVENT_VIDEO_CHAT_SSC.ACCEPT_CALL_SSC, {
      data: payload,
      msg: 'Receiver accept your calling',
      status: 200,
    });
  };

  listens[EVENT_VIDEO_CHAT_CSS.END_CALL_CSS] = async (payload) => {
    //add message, update lastest message
    await message.createMessage(payload);
    const ids = [`Channel_call_${payload.userId}`, `Channel_call_${payload.senderId}`]
    socket.to(ids).emit(EVENT_VIDEO_CHAT_SSC.END_CALL_SSC, {
      data: payload,
      msg: 'end calling successfully',
      status: 200,
    });
  };

  listens[EVENT_VIDEO_CHAT_CSS.JOIN_ROOM_VIDEO_CHAT_CSS] = async (payload) => {
    const {
      userId,
      callerId
    } = payload || {};
    socket.join(`Channel_call_${userId}`);
    let profile;
    if (callerId) {
      profile = await Profile.findById({
        _id: callerId
      });
    }
    if (!profile) return;
    socket.to(`Channel_call_${userId}`).emit(EVENT_VIDEO_CHAT_SSC.JOIN_ROOM_VIDEO_CHAT_SSC, {
      data: {
        profile
      },
      msg: 'Has incoming calling',
      status: 200,
    });
  };

  listens[EVENT_VIDEO_CHAT_CSS.LEAVE_ROOM_VIDEO_CHAT_CSS] = (payload) => {
    socket.leave(payload.room);
    socket.to(payload.room).emit(EVENT_VIDEO_CHAT_SSC.LEAVE_ROOM_VIDEO_CHAT_SSC, {
      data: null,
      msg: 'leave room success',
      status: 200,
    });
  };

  listens[EVENT_VIDEO_CHAT_CSS.TURN_OFF_VIDEO_CHAT_CSS] = (payload) => {
    socket.to(`Channel_call_${payload.userId}`).emit(EVENT_VIDEO_CHAT_SSC.TURN_OFF_VIDEO_CHAT_SSC, {
      data: payload,
      msg: 'turn off video',
      status: 200,
    });
  };

  return listens;
}

module.exports = VideoHandler;
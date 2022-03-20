const mongoose = require('mongoose');
const schema = mongoose.Schema;

const MessageSchema = new schema({
  conversationId: {
    type: String,
    required: true,
  },
  userSenderId: {
    type: String,
    required: true,
  },

  data: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 0,
  },
  /**
   * 0: text
   * 1: image
   * 2: audio
   * 3: video
   */
  isSeen: {
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const message = mongoose.model('message', MessageSchema);
module.exports = message;

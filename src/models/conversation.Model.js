const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ConversationSchema = new schema({
  _id: { type: String },
  name: {
    type: String,
    required: true,
    default: 'Chat box',
  },
  lastestMessage: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: 1,
  },
  updatedDate: {
    type: Date,
    default: Date.now(),
  },
});

const conversation = mongoose.model('conversation', ConversationSchema);
module.exports = conversation;

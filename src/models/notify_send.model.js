const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const Notify_sendSchema = new schema({
  postId: { type: String, required: true },
  templateId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  createdDate: {
    type: Date,
    required: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
});

const notify_send = mongoose.model('notify_send', Notify_sendSchema);
module.exports = notify_send;

const mongoose = require('mongoose');

const schema = mongoose.Schema;

const Notify_sendSchema = new schema({
  representId: { type: String, required: true },
  templateId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}).index({senderId:1,receiverId:1,representId:1});

const notify_send = mongoose.model('notify_send', Notify_sendSchema);
module.exports = notify_send;

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Notify_sendSchema = new schema({
  _id: { type: String },
  postId: { type: String, require: true },
  templateId: { type: String, require: true },
  senderId: { type: String, require: true },
  receiverId: { type: String, require: true },
  createdDate: { type: Date, require: true, default: Date.now() },
});

const notify_send = mongoose.model('notify_send', Notify_sendSchema);
module.exports = notify_send;

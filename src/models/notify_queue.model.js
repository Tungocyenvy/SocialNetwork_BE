const mongoose = require('mongoose');

const schema = mongoose.Schema;

const Notify_queueSchema = new schema({
  userId: { type: String, required: true },
  notifyId: { type: String, required: true },
  isRead: { type: Boolean, required: true, default: false },
  createdDate: { type: Date, default: Date.now },
});

const Notify_queue = mongoose.model('notify_queue', Notify_queueSchema);
module.exports = Notify_queue;

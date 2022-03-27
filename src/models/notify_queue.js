const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const Notify_queueSchema = new schema({
  userId: { type: String, required: true },
  notifyId: { type: String },
  isRead: { type: String, required: true, default: false },
  createdDate: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
});

const Notify_queue = mongoose.model('notify_queue', Notify_queueSchema);
module.exports = Notify_queue;

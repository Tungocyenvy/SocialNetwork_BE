const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Notify_queueSchema = new schema({
  _id: { type: String },
  listNotify: [
    {
      notifyId: { type: String },
      isRead: { type: String, required: true, default: false },
    },
  ],
});

const Notify_queue = mongoose.model('notify_queue', Notify_queueSchema);
module.exports = Notify_queue;

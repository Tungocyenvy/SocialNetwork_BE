const mongoose = require('mongoose');

const schema = mongoose.Schema;

const Notify_maingroupSchema = new schema({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  groupId: { type: String, required: true },
  isRead: { type: Boolean, required: true, default: false },
  createdDate: { type: Date, default: Date.now },
});

const notify_maingroup = mongoose.model(
  'notify_maingroup',
  Notify_maingroupSchema,
);
module.exports = notify_maingroup;

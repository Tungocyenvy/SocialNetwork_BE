const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const Notify_maingroupSchema = new schema({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  groupId: { type: String, required: true },
  isRead: { type: String, required: true, default: false },
  createdDate: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
});

const notify_maingroup = mongoose.model(
  'notify_maingroup',
  Notify_maingroupSchema,
);
module.exports = notify_maingroup;

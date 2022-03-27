const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const ReplySchema = new schema({
  _id: { type: String },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  commentId: { type: String, required: true },
  createdDate: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
});

const reply = mongoose.model('reply', ReplySchema);
module.exports = reply;

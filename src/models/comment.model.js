const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const CommentSchema = new schema({
  _id: { type: String },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  postId: { type: String, required: true },
  countReply: { type: Number, required: true, default: 0 },
  createdDate: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
});

const comment = mongoose.model('comment', CommentSchema);
module.exports = comment;
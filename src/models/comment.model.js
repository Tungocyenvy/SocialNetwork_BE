const mongoose = require('mongoose');

const schema = mongoose.Schema;

const CommentSchema = new schema({
  _id: { type: String },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  postId: { type: String, required: true },
  countReply: { type: Number, required: true, default: 0 },
  createdDate: { type: Date, default: Date.now },
});

const comment = mongoose.model('comment', CommentSchema);
module.exports = comment;

const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const CommentSchema = new schema({
  _id: { type: String },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  postId: { type: String, required: true },
  createdDate: { type: Date, default: Date.now() },
  reply: [
    {
      _id: { type: String },
      userId: { type: String, required: true },
      content: { type: String, required: true },
      createdDate: {
        type: Date,
        default: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    },
  ],
});

const comment = mongoose.model('comment', CommentSchema);
module.exports = comment;

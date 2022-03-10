const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CommentSchema = new schema({
  _id: { type: String },
  userId: { type: String, require: true },
  content: { type: String, require: true },
  postId: { type: String, require: true },
  createdDate: { type: Date },
  reply: [
    {
      _id: { type: String },
      userId: { type: String, require: true },
      content: { type: String, require: true },
      createdDate: { type: Date },
    },
  ],
});

const comment = mongoose.model('comment', CommentSchema);
module.exports = comment;

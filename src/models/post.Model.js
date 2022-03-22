const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const PostSchema = new schema({
  _id: String,
  title: { type: String, require: true },
  content: { type: String, require: true },
  author: { type: String, require: true },
  createdDate: {
    type: Date,
    require: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

const mongoose = require('mongoose');

const schema = mongoose.Schema;

const PostSchema = new schema({
  _id: String,
  title: { type: String, require: true },
  content: { type: String, require: true },
  author: { type: String, require: true },
  groupId: { type: String, require: true },
  isMainGroup: { type: Boolean, default: true },
  countReport:{ type: Number, required: true, default:0 },
  categoryId:{ type: String, default:null },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

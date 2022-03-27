const mongoose = require('mongoose');
const schema = mongoose.Schema;

const postMainGroupSchema = new schema({
  _id: { type: String, required: true },
  groupId: { type: String, required: true },
});

const post = mongoose.model('post_maingroup', postMainGroupSchema);
module.exports = post;

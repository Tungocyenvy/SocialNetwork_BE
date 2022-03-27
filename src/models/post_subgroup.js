const mongoose = require('mongoose');
const schema = mongoose.Schema;

const postSubGroupSchema = new schema({
  _id: { type: String, required: true },
  groupId: { type: String, required: true },
});

const post = mongoose.model('post_subgroup', postSubGroupSchema);
module.exports = post;

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const mainGroupSchema = new schema({
  _id: { type: String },
  name: { type: String, required: true },
  listUserId: { type: Array, required: true },
  listAdminId: { type: Array, required: true },
  listPostId: { type: Array, required: true },
});

const maingroup = mongoose.model('maingroup', mainGroupSchema);
module.exports = maingroup;

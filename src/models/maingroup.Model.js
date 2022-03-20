const mongoose = require('mongoose');
const schema = mongoose.Schema;

const mainGroupSchema = new schema({
  _id: { type: String },
  name: { type: String, require: true },
  listUserId: { type: Array, require: true },
  listAdminId: { type: Array, require: true },
  listPostId: { type: Array, require: true },
});

const maingroup = mongoose.model('maingroup', mainGroupSchema);
module.exports = maingroup;

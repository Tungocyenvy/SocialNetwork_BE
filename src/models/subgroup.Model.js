const mongoose = require('mongoose');
const schema = mongoose.Schema;

const subGroupSchema = new schema({
  _id: { type: String },
  name: { type: String, require: true },
  listUserId: { type: Array, require: true },
  listAdminId: { type: Array, require: true },
  listPostId: { type: Array, require: true },
  image: { type: String, required: true },
  createdDate: { type: Date, require: true, default: Date.now() },
});

const subgroup = mongoose.model('subgroup', subGroupSchema);
module.exports = subgroup;

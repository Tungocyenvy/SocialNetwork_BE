const mongoose = require('mongoose');
const schema = mongoose.Schema;

const RoleSchema = new schema({
  _id: { type: Number, required: true },
  nameVn: { type: String, required: true },
  nameEn: { type: String, required: true },
});

const role = mongoose.model('role', RoleSchema);
module.exports = role;

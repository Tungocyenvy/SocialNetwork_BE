const mongoose = require('mongoose');

const schema = mongoose.Schema;

const AccountSchema = new schema({
  _id: { type: String, required: true },
  password: { type: String, required: true },
  roleId: { type: Number, required: true },
  isDelete: { type: Boolean, required: true, default: false },
  isAlumni :{ type: Boolean, required: true, default: false },
  deletedDate: { type: Date},
});

const account = mongoose.model('account', AccountSchema);
module.exports = account;

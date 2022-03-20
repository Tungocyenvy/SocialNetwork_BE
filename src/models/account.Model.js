const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AccountSchema = new schema({
  _id: { type: String, require: true },
  password: { type: String, require: true },
  role: { type: String, require: true },
  isDelete: { type: Boolean, require: true, default: false },
});

const Account = mongoose.model('Account', AccountSchema);
module.exports = Account;

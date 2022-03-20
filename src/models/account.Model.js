const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AccountSchema = new schema({
  _id: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isDelete: { type: Boolean, required: true, default: false },
});

const Account = mongoose.model('Account', AccountSchema);
module.exports = Account;

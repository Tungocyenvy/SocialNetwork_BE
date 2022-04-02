const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const AccountSchema = new schema({
  _id: { type: String, required: true },
  password: { type: String, required: true },
  roleId: { type: Number, required: true },
  isAdminSG: { type: Boolean, required: true, default: false },
  isDelete: { type: Boolean, required: true, default: false },
  deletedDate: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
});

const account = mongoose.model('account', AccountSchema);
module.exports = account;

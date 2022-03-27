const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userMainGroupSchema = new schema({
  userId: { type: String, required: true },
  groupId: { type: String, required: true },
  isStudent: { type: Boolean, required: true, default: true },
  isAdmin: { type: Boolean, required: true, default: false },
});

const user = mongoose.model('user_maingroup', userMainGroupSchema);
module.exports = user;

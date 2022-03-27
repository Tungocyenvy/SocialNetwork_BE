const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSubGroupSchema = new schema({
  userId: { type: String, required: true },
  groupId: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
});

const user = mongoose.model('user_subgroup', userSubGroupSchema);
module.exports = user;

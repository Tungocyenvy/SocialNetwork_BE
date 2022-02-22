const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ProfileSchema = new schema({
  _id: { type: String, require: true },
  fullname: { type: String, require: true },
  dob: { type: Date, require: true },
  address: { type: String, require: true },
  phone: { type: String, require: true },
  email: { type: String, require: true },
  avatar: { type: String, require: true },
  year: { type: Number, require: true },
});

const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;

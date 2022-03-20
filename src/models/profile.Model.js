const mongoose = require('mongoose');
const schema = mongoose.Schema;
const avatarDefaul =
  'https://res.cloudinary.com/blogreview/image/upload/v1636626365/review_web/hzshd4vahy6hw6m0a9p5.png';
const ProfileSchema = new schema({
  _id: { type: String, require: true },
  fullname: { type: String, require: true },
  dob: { type: Date, require: true },
  address: { type: String, require: true },
  phone: { type: String, require: true },
  email: { type: String, require: true },
  avatar: { type: String, require: true, default: avatarDefaul },
  year: { type: Number, require: true },
});

const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;

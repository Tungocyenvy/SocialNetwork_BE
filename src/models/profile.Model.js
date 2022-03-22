const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;
const avatarDefaul =
  'https://res.cloudinary.com/blogreview/image/upload/v1636626365/review_web/hzshd4vahy6hw6m0a9p5.png';
const ProfileSchema = new schema({
  _id: { type: String, required: true },
  fullname: { type: String, required: true },
  faculity: { type: String },
  dob: { type: moment().format('YYYY-MM-DD HH:mm:ss'), required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true, default: avatarDefaul },
  year: { type: Number, required: true },
});

const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;

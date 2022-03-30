const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const imageDefault =
  'https://res.cloudinary.com/blogreview/image/upload/v1636626365/review_web/hzshd4vahy6hw6m0a9p5.png';

const GroupSchema = new schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  isMain: { type: Boolean, default: false },
  createdDate: {
    type: Date,
    required: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
  cateId: { type: String, required: true },
  image: { type: String, required: true, default: imageDefault },
});

const group = mongoose.model('group', GroupSchema);
module.exports = group;

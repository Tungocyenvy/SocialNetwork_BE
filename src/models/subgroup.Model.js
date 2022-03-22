const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const subGroupSchema = new schema({
  _id: { type: String },
  name: { type: String, required: true },
  listUserId: { type: Array, required: true },
  listAdminId: { type: Array, required: true },
  listPostId: { type: Array, required: true },
  image: { type: String, required: true },
  createdDate: {
    type: Date,
    required: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
  cateId: { type: String, required: true },
});

const subgroup = mongoose.model('subgroup', subGroupSchema);
module.exports = subgroup;

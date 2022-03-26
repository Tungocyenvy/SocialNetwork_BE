const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const GroupSchema = new schema({
  _id: { type: String },
  name: { type: String, required: true },
  isMain: { type: Boolean, default: false },
  createdDate: {
    type: Date,
    required: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
  cateId: { type: String, required: true },
});

const group = mongoose.model('group', GroupSchema);
module.exports = group;

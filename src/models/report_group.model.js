const mongoose = require('mongoose');

const schema = mongoose.Schema;

const reportGroupSchema = new schema({
  reportId: { type: String, required: true },
  groupId: { type: String, required: true },
  count: { type: Number, required: true, default: 1 },
});

const report = mongoose.model('report_group', reportGroupSchema);
module.exports = report;

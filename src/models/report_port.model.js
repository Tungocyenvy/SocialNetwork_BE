const mongoose = require('mongoose');

const schema = mongoose.Schema;

const reportReportSchema = new schema({
  reportId: { type: String, required: true },
  postId: { type: String, required: true },
  count: { type: Number, required: true, default: 1 },
});

const report = mongoose.model('report_post', reportReportSchema);
module.exports = report;

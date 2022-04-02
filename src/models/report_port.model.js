const mongoose = require('mongoose');
const moment = require('moment');
const schema = mongoose.Schema;

const reportReportSchema = new schema({
  reportId: { type: String, required: true },
  postId: { type: String, required: true },
  createdDate: {
    type: Date,
    required: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
});

const report = mongoose.model('report_post', reportReportSchema);
module.exports = report;

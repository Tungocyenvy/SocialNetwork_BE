const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  name: { type: String, required: true },
  isDelete: { type: Boolean, required: true, default: false },
});

const category_report = mongoose.model('category_report', CategorySchema);
module.exports = category_report;

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Notify_templateSchema = new schema({
  _id: { type: String },
  type: { type: String, required: true },
  content: { type: String, required: true },
});

const notify_template = mongoose.model(
  'notify_template',
  Notify_templateSchema,
);
module.exports = notify_template;

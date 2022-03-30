const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  name: { type: String, required: true },
  isDelete: { type: String, required: true, default: false },
});

const category = mongoose.model('category', CategorySchema);
module.exports = category;

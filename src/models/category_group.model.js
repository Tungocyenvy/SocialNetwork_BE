const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  name: { type: String, required: true },
  isDelete: { type: String, required: true, default: false },
});

const category_group = mongoose.model('category_group', CategorySchema);
module.exports = category_group;

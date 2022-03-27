const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
});

const category = mongoose.model('category', CategorySchema);
module.exports = category;

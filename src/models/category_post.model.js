const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  nameEn: { type: String, required: true },
  nameVi: { type: String, required: true },
  isDelete: { type: Boolean, required: true, default: false },
});

const category_post = mongoose.model('category_post', CategorySchema);
module.exports = category_post;

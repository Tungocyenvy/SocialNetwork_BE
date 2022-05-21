const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CategorySchema = new schema({
  nameEn: { type: String, required: true },
  nameVi: { type: String, required: true },
  type: {type: Number, required: true},
  isDelete: { type: Boolean, required: true, default: false },
});

const category = mongoose.model('category', CategorySchema);
module.exports = category;

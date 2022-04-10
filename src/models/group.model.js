const mongoose = require('mongoose');

const schema = mongoose.Schema;

const imageDefault =
  'https://res.cloudinary.com/blogreview/image/upload/v1648876903/j0pbzmmrgsomqoywdqde.jpg';

const GroupSchema = new schema({
  _id: { type: String, required: true },
  nameEn: { type: String, required: true },
  nameVi: { type: String, required: true },
  isMain: { type: Boolean, default: false },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  cateId: { type: String, required: true, default: 'none' },
  image: { type: String, required: true, default: imageDefault },
});

const group = mongoose.model('group', GroupSchema);
module.exports = group;

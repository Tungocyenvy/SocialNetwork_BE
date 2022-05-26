const mongoose = require('mongoose');
const schema = mongoose.Schema;

const posterDefaul =
  'https://res.cloudinary.com/blogreview/image/upload/v1652884458/kurtnlhv8oeipqefd1sx.png';

const newsSchema = new schema({
  companyId: { type: String, required: true },
  title:{type: String, required: true},
  position: { type: String, required: true },
  salary: { type: String, required: true},
  experience: { type: String, required: true},
  quantity:{type:String, required:true},
  description: { type: String, required: true},
  poster: { type: String, required: true, default:posterDefaul},
  location: { type: String, required: true},
  phone: { type: String, required: true},
  startDate: { type: Date,required: true,default: Date.now},
  endDate: { type: Date,required: true},
  isExpire:{type:Boolean,required: true, default:false}
});

const news = mongoose.model('recruitment_news', newsSchema);
module.exports = news;

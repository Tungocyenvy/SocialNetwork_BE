const mongoose = require('mongoose');
const schema = mongoose.Schema;
const logoDefaul =
  'https://res.cloudinary.com/blogreview/image/upload/v1636626365/review_web/hzshd4vahy6hw6m0a9p5.png';
const CompanySchema = new schema({
  _id:{ type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  logo: { type: String, required: true, default: logoDefaul },
  keyword:{type:String,required:true}
}).index({keyword:'text'});

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;

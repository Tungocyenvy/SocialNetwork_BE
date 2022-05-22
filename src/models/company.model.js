const mongoose = require('mongoose');
const schema = mongoose.Schema;
const logoDefaul =
  'https://res.cloudinary.com/blogreview/image/upload/v1652884439/fwur45xk4dnbrkcopxqm.png';
const CompanySchema = new schema({
  _id:{ type: String, required: true },
  fullname: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true, default: logoDefaul },
  keyword:{type:String,required:true}
}).index({keyword:'text'});

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;

const Category = require('../models/category.model');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('category'));
};

/**
 * 
 * 1. Group
 * 2. Post
 * 3. Report
 */

const getCategory= async (req, lang) => {
  let { type=1,isDelete=false } = req.params ||{};
  let perPage = 10;
  let { isAll = 'true', page = 1 } = req.query || {};
  const msg = getMsg(lang);

  try {
    let numType=1;
    switch(type)
    {
      case 'group': {numType=1; break;}
      case 'post': {numType=2; break;}
      case 'report': {numType =3; break;}
      default : {numType=1; break;}
    }
    
    const total = await Category.countDocuments({ isDelete: isDelete, type:numType });
    if (total <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 200,
        data: [],
      };
    }

    if (isAll==='true') perPage = total;

    const result = await Category.find({ isDelete: isDelete,type:numType })
      .skip(perPage * page - perPage)
      .limit(perPage);

    return {
      msg: msg.getCate,
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateCategory = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    let checkName = await Category.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      _id: { $nin: body._id },
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    delete body.type;
    const res = await Category.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      let rsMsg = msg.updateCate;
      if (body.isDelete != null) {
        if (body.isDelete == true) {
          rsMsg = msg.deleteCate;
        } else {
          rsMsg = msg.recoveryCate;
        }
      }
      const result = await Category.findById({ _id: body._id });
      return {
        msg: rsMsg,
        statusCode: 200,
        data: result,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createCategory = async (req, lang) => {
  let {type}= req.params||{};
  let body = req.body||{};
  const msg = getMsg(lang);
  try {
    let numType=1;
    switch(type)
    {
      case "group": numType=1; break;
      case "post": numType=2; break;
      case "report": numType =3; break;
      default : numType=1; break;
    }
    body.type=numType;
    const checkName = await Category.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await Category.create(body);
    if (res) {
      return {
        msg: msg.createCate,
        statusCode: 200,
        data: res,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  getCategory,
  updateCategory,
  createCategory
};

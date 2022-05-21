const CategoryGroup = require('../models/category_group.model');
const CategoryReport = require('../models/category_report.model');
const CategoryPost = require('../models/category_post.model');
const Category = require('../models/category.model');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('category'));
};

//CATEGORY FOR GROUP
const getCategoryGroup = async (req, lang) => {
  let { isDelete } = req.params || false;
  let perPage = 10;
  let { isAll = 'true', page = 1 } = req.query || {};
  const msg = getMsg(lang);

  try {
    const total = await CategoryGroup.countDocuments({ isDelete: isDelete });
    if (total <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 200,
        data: [],
      };
    }

    if (isAll==='true') perPage = total;

    const result = await CategoryGroup.find({ isDelete: isDelete })
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

const updateCategoryGroup = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    let checkName = await CategoryGroup.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      _id: { $nin: body._id },
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      let rsMsg = msg.updateCate;
      if (body.isDelete != null) {
        if (body.isDelete == true) {
          rsMsg = msg.deleteCate;
        } else {
          rsMsg = msg.recoveryCate;
        }
      }
      const result = await CategoryGroup.findById({ _id: body._id });
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

const createCategoryGroup = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const checkName = await CategoryGroup.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.create(body);
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

//CATEGORY FOR REPORT
const getCategoryReport = async (req, lang) => {
  let { isDelete = false } = req.params || {};
  const msg = getMsg(lang);
  try {
    const result = await CategoryReport.find({ isDelete: isDelete });
    if (result.length <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 200,
        data: [],
      };
    }
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

const updateCategoryReport = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const checkName = await CategoryReport.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      _id: { $nin: body._id },
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryReport.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      let rsMsg = msg.updateCate;
      if (body.isDelete != null) {
        if (body.isDelete == true) {
          rsMsg = msg.deleteCate;
        } else {
          rsMsg = msg.recoveryCate;
        }
      }
      const result = await CategoryReport.findById({ _id: body._id });
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

const createCategoryReport = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const checkName = await CategoryReport.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryReport.create(body);
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

//CATEGORY FOR POST (MAIN NOTIFY)
const getCategoryPost = async (req, lang) => {
  let { isDelete = false } = req.params || {};
  const msg = getMsg(lang);
  try {
    const result = await CategoryPost.find({ isDelete: isDelete });
    if (result.length <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 200,
        data: [],
      };
    }
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

const updateCategoryPost = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const checkName = await CategoryPost.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      _id: { $nin: body._id },
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryPost.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      let rsMsg = msg.updateCate;
      if (body.isDelete != null) {
        if (body.isDelete == true) {
          rsMsg = msg.deleteCate;
        } else {
          rsMsg = msg.recoveryCate;
        }
      }
      const result = await CategoryPost.findById({ _id: body._id });
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

const createCategoryPost = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const checkName = await CategoryPost.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryPost.create(body);
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
    const res = await CategoryGroup.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      let rsMsg = msg.updateCate;
      if (body.isDelete != null) {
        if (body.isDelete == true) {
          rsMsg = msg.deleteCate;
        } else {
          rsMsg = msg.recoveryCate;
        }
      }
      const result = await CategoryGroup.findById({ _id: body._id });
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
    const checkName = await CategoryGroup.find({
      $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
    });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.create(body);
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
  getCategoryGroup,
  updateCategoryGroup,
  createCategoryGroup,
  getCategoryReport,
  updateCategoryReport,
  createCategoryReport,
  getCategoryPost,
  updateCategoryPost,
  createCategoryPost,
  getCategory,
  updateCategory,
  createCategory
};

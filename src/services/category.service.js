const CategoryGroup = require('../models/category_group.model');
const CategoryReport = require('../models/category_report.model');
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
  let { isAll = true, page = 1 } = req.query || {};
  const msg = getMsg(lang);

  try {
    const total = await CategoryGroup.countDocuments({ isDelete: isDelete });
    if (total <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 300,
      };
    }

    if (isAll) perPage = total;

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
    const checkName = await CategoryGroup.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await CategoryGroup.findById({ _id: body._id });
      return {
        msg: msg.updateCate,
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
    const checkName = await CategoryGroup.find({ name: body.name });
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
  let { isAll = false } = req.query || {};
  const msg = getMsg(lang);
  try {
    const result = isAll
      ? await CategoryReport.find()
      : await CategoryReport.find({ isDelete: false });
    if (result.length <= 0) {
      return {
        msg: msg.notFound,
        statusCode: 200,
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
    const checkName = await CategoryReport.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: msg.exists,
        statusCode: 300,
      };
    }
    const res = await CategoryReport.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await CategoryReport.findById({ _id: body._id });
      return {
        msg: msg.updateCate,
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
    const checkName = await CategoryReport.find({ name: body.name });
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

module.exports = {
  getCategoryGroup,
  updateCategoryGroup,
  createCategoryGroup,
  getCategoryReport,
  updateCategoryReport,
  createCategoryReport,
};

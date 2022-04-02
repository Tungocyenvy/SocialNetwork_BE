const ReportGroup = require('../models/report_group.model');
const ReportPost = require('../models/report_port.model');

//REPORT FOR GROUP
const getReportGroup = async (body) => {
  let { groupId } = body || {};
  try {
    const listReport = await ReportGroup.find({ groupId: groupId });
    if (listReport.length <= 0) {
      return {
        msg: "Don't have any report",
        statusCode: 300,
      };
    }

    const total = await CategoryGroup.countDocuments({ isDelete: isDelete });
    if (total <= 0) {
      return {
        msg: "Don't have any category",
        statusCode: 300,
      };
    }

    if (isAll) perPage = total;

    const result = await CategoryGroup.find({ isDelete: isDelete })
      .skip(perPage * page - perPage)
      .limit(perPage);
    return {
      msg: 'get category successful!',
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: 'An error occurred during the get category  process',
      statusCode: 300,
    };
  }
};

const updateCategoryGroup = async (body) => {
  try {
    const checkName = await CategoryGroup.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await CategoryGroup.findById({ _id: body._id });
      return {
        msg: 'update category successfull',
        statusCode: 200,
        data: result,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the update category process',
      statusCode: 300,
    };
  }
};

const createCategoryGroup = async (body) => {
  try {
    const checkName = await CategoryGroup.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await CategoryGroup.create(body);
    if (res) {
      return {
        msg: 'Create category susccessful!',
        statusCode: 200,
        data: res,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the create category  process',
      statusCode: 300,
    };
  }
};

//CATEGORY FOR REPORT
const getCategoryReport = async (req) => {
  let { isAll = false } = req.query || {};
  try {
    const result = isAll
      ? await CategoryReport.find()
      : await CategoryReport.find({ isDelete: false });
    if (result.length <= 0) {
      return {
        msg: "Don't have any category!",
        statusCode: 200,
      };
    }
    return {
      msg: 'get category successful!',
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: 'An error occurred during the get category  process',
      statusCode: 300,
    };
  }
};

const updateCategoryReport = async (body) => {
  try {
    const checkName = await CategoryReport.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await CategoryReport.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await CategoryReport.findById({ _id: body._id });
      return {
        msg: 'update category successfull',
        statusCode: 200,
        data: result,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the update category process',
      statusCode: 300,
    };
  }
};

const createCategoryReport = async (body) => {
  try {
    const checkName = await CategoryReport.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await CategoryReport.create(body);
    if (res) {
      return {
        msg: 'Create category susccessful!',
        statusCode: 200,
        data: res,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the create category  process',
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

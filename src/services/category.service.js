const Category = require('../models/category.model');

const getCategory = async (req) => {
  let { isDelete } = req.params || false;
  let perPage = 10;
  let { isAll = true, page = 1 } = req.query || {};
  try {
    const total = await Category.countDocuments({ isDelete: isDelete });
    if (total <= 0) {
      return {
        msg: "Don't have any category",
        statusCode: 300,
      };
    }

    if (isAll) perPage = total;

    const result = await Category.find({ isDelete: isDelete })
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

const updateCategory = async (body) => {
  try {
    const checkName = await Category.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await Category.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await Category.findById({ _id: body._id });
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

const createCategory = async (body) => {
  try {
    const checkName = await Category.find({ name: body.name });
    if (checkName.length > 0) {
      return {
        msg: 'category name already exists',
        statusCode: 300,
      };
    }
    const res = await Category.create(body);
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
  getCategory,
  updateCategory,
  createCategory,
};

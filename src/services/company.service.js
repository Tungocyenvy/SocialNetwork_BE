const mongoose = require('mongoose');
const { createToken } = require('./jwt.service');
const bcrypt = require('bcrypt');
const Account = require('../models/account.model');
const Company = require('../models/company.model');
const News = require('../models/recruitment_news.model');
const moment = require('moment');
const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('company'));
};

const removeVN = (Text) => {
  return Text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const getRandomString = () => {
  let result = '';
  const base = '0123456789';
  const baseLength = base.length;

  for (let i = 0; i < 6; i++) {
    const randomIndex = getRandomInt(0, baseLength);
    result += base[randomIndex];
  }
  return result;
};

const signup = async (req, lang) => {
  let body = req.body || {};
  const msg = getMsg(lang);
  try {
    const companyId = body.abbreviation;
    let data = body;
    data._id = body.abbreviation;
    data.keyword = companyId + " " + body.fullname + " " + removeVN(data.fullname);
    delete data.abbreviation;
    const res = await Company.create(data);
    if (res) {
      /**CREATE ACCOUNT */
      const randomNum = getRandomString();
      const password = companyId + '@social' + randomNum;
      const saltOrRound = 8;
      const hassPassword = await bcrypt.hash(password, saltOrRound);
      if (!hassPassword) {
        await Company.findByIdAndDelete({ _id: companyId });
        return {
          msg: msg.errHashPass.replace('%s', companyId),
          statusCode: 300
        };
      }
      let aoc = [];
      aoc[0] = "none";
      const newAccount = new Account({
        _id: companyId,
        password: hassPassword,
        roleId: 5,
        aoc
      });

      try {
        await newAccount.save();
      } catch {
        await Company.findByIdAndDelete({ _id: companyId });
        return {
          msg: msg.arrAddAccount.replace('%s', companyId),
          statusCode: 300
        };
      }
      let accountData = {};
      accountData._id = companyId;
      accountData.password = password;
      return {
        msg: msg.signup,
        statusCode: 200,
        data: accountData,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//CRUD
const createPost = async (companyId, body, lang) => {
  const msg = getMsg(lang);
  try {
    let data = body || {};
    data.companyId = companyId;
    const result = await News.create(data);
    return {
      msg: msg.createdPost,
      statusCode: 200,
      data: result
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
}

const updatePost = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const res = await News.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await News.findById({ _id: body._id });
      return {
        msg: msg.updatePost,
        statusCode: 200,
        data: result,
      };
    } else {
      return {
        msg: msg.notFoundPost,
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const deletePost = async (req, lang) => {
  let { newsId = '' } = req.query || {};
  const msg = getMsg(lang);
  try {
    await News.findByIdAndDelete({ _id: newsId });
    return {
      msg: msg.deletePost,
      statusCode: 200,
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getDetailPost = async (req, lang) => {
  let { newsId } = req.params || {};
  const msg = getMsg(lang);
  try {
    if (!newsId) newsId = '';
    const news = await News.findById({ _id: newsId });
    if (news) {
      const company = await Company.findById({ _id: news.companyId });
      let tmp = { ...company._doc };
      tmp.companyDescription = company.description;
      delete tmp.description;
      const result = { ...news._doc, ...tmp };
      return {
        msg: msg.getDetail,
        data: result,
        statusCode: 200,
      };
    } else {
      return {
        msg: msg.notFoundPost,
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getPostByCompanyId = async (companyId, req, lang) => {
  const msg = getMsg(lang);
  let perPage = 10;
  let { page = 1, isExpire = 'false' } = req.query || {};
  try {
    const total = await News.countDocuments({
      companyId: companyId,
      isExpire: isExpire,
    });
    const result = await News.find({ companyId: companyId, isExpire: isExpire })
      .sort({
        startDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);
    return {
      msg: total <= 0 ? msg.notHavePost : msg.getAllPost,
      statusCode: 200,
      data: { total, result }
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
}

//for newsfeed
const getListPost = async (req, lang) => {
  let perPage = 3;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    const total = await News.countDocuments({
      isExpire: false,
    });
    let result = [];
    if (total <= 0) {
      return {
        msg: msg.notHavePost,
        statusCode: 200,
        data: result
      };
    }
    const news = await News.find({ isExpire: false })
      .sort({
        startDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);

    const companyIds = map(news, 'companyId');
    const company = await Company.find({ _id: { $in: companyIds } });
    const objCompany = keyBy(company, '_id');
    result = news.map(item => {
      const fullname = objCompany[item.companyId].fullname;
      return { ...item._doc, fullname };
    })
    return {
      msg: msg.getAllPost,
      statusCode: 200,
      data: { total, result }
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
}

//get post same company
const getListPostSameCompany = async (req, lang) => {
  const msg = getMsg(lang);
  let perPage = 10;
  let { page } = req.query || 1;
  let { companyId = -1, newsId = -1 } = req.params || {}
  try {
    const total = await News.countDocuments({
      companyId: companyId,
      _id: { $nin: newsId },
      isExpire: false,
    });
    const news = await News.find({ companyId: companyId, _id: { $nin: newsId }, isExpire: false, })
      .sort({
        startDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);
    let result = [];
    if (total > 0) {
      const company = await Company.findById({ _id: companyId });
      result = news.map(item => {
        return { ...item._doc, fullname: company.fullname };
      })
    }
    return {
      msg: total <= 0 ? msg.notHavePost : msg.getAllPost,
      statusCode: 200,
      data: { total, result }
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
}

module.exports = {
  signup,
  createPost,
  updatePost,
  deletePost,
  getDetailPost,
  getPostByCompanyId,
  getListPost,
  getListPostSameCompany
};

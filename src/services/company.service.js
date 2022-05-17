const mongoose = require('mongoose');
const { createToken } = require('./jwt.service');
const bcrypt = require('bcrypt');
const Account =require('../models/account.model');
const Company = require('../models/company.model');
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

const signup = async (req,lang) => {
  let body = req.body || {};
  const msg = getMsg(lang);
  try {
    const companyId= body.abbreviation;
    let data = body;
    data._id= body.abbreviation;
    data.keyword = companyId+" "+body.name + " " + removeVN(data.name);
    delete data.abbreviation;
    const res = await Company.create(data);
    if(res)
    {
    /**CREATE ACCOUNT */
    const randomNum = getRandomString();
    const password = companyId + '@social' + randomNum;
    const saltOrRound = 8;
    const hassPassword = await bcrypt.hash(password, saltOrRound);
    if (!hassPassword) {
      await Company.findByIdAndDelete({ _id: companyId });
      return {
        msg:msg.errHashPass.replace('%s', companyId),
        statusCode: 300
      };
    }
    let aoc=[];
    aoc[0]="none";
    const newAccount = new Account({
      _id: companyId,
      password: hassPassword,
      roleId:5,
      aoc
    });
    
    try {
      await newAccount.save();
    } catch {
      await Company.findByIdAndDelete({ _id: companyId });
      return {
        msg:msg.arrAddAccount.replace('%s', companyId),
        statusCode: 300
      };
    }
    let accountData={};
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

module.exports = {
  signup
};

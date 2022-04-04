const Profile = require('../models/profile.model');
const Group = require('../models/group.model');
const userSubGroup = require('../models/user_subgroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const { map, keyBy } = require('lodash');
const moment = require('moment');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('search'));
};

//search by name or identify
const searchUser = async (req, lang) => {
  let keyword = req.query.keyword;
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    const sub = 'admin';

    let result;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;

    //check key is identify (number or admin)
    if (Number(keyword) === Number(keyword) + 0 || keyword.indexOf(sub) === 0) {
      total = await Profile.countDocuments({ _id: keyword });
      if (total > 0) {
        result = await Profile.findById({ _id: keyword })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    } else {
      //search by name
      total = await Profile.countDocuments({ fullname: key });
      if (total > 0) {
        result = await Profile.find({ fullname: key })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    }
    return {
      msg: msg.searchUser,
      data: { result, total },
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//search by name or identify
//forSubGroup
const searchUserForSubGroup = async (req, lang) => {
  let perPage = 10;
  let { keyword, groupId, page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const sub = 'admin';

    let result;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;

    //check key is identify (number or admin)
    if (Number(keyword) === Number(keyword) + 0 || keyword.indexOf(sub) === 0) {
      //check in group
      total = await userSubGroup.countDocuments({
        userId: keyword,
        groupId: groupId,
      });
      if (total > 0) {
        result = await Profile.findById({ _id: keyword })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    } else {
      //search by name
      const listUser = await userSubGroup.find({ groupId: groupId });
      if (listUser.length <= 0) {
        return {
          msg: msg.notHaveUser,
          statusCode: 300,
        };
      }

      const userIds = map(listUser, 'userId');
      total = await Profile.countDocuments({
        _id: {
          $in: userIds,
        },
        fullname: key,
      });
      if (total > 0) {
        result = await Profile.find({
          _id: {
            $in: userIds,
          },
          fullname: key,
        })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    }
    return {
      msg: msg.searchUser,
      data: { result, total },
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//forMainGroup
const searchUserForMainGroup = async (req, lang) => {
  let perPage = 10;
  let { keyword, groupId, page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const sub = 'admin';

    let result;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;

    //check key is identify (number or admin)
    if (Number(keyword) === Number(keyword) + 0 || keyword.indexOf(sub) === 0) {
      //check in group
      total = await userMainGroup.countDocuments({
        userId: keyword,
        groupId: groupId,
      });
      if (total > 0) {
        result = await Profile.findById({ _id: keyword })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    } else {
      //search by name
      const listUser = await userMainGroup.find({ groupId: groupId });
      if (listUser.length <= 0) {
        return {
          msg: msg.notHaveUser,
          statusCode: 300,
        };
      }

      const userIds = map(listUser, 'userId');
      total = await Profile.countDocuments({
        _id: {
          $in: userIds,
        },
        fullname: key,
      });
      if (total > 0) {
        result = await Profile.find({
          _id: {
            $in: userIds,
          },
          fullname: key,
        })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    }
    return {
      msg: msg.searchUser,
      data: { result, total },
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//search by name or identify
const searchGroup = async (req, lang) => {
  let keyword = req.query.keyword;
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    let result;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    //search by name
    const total = await Group.countDocuments({
      $or: [{ nameEn: key }, { nameVi: key }],
      isMain: false,
    });
    if (total > 0) {
      result = await Group.find({
        $or: [{ nameEn: key }, { nameVi: key }],
        isMain: false,
      })
        .skip(perPage * page - perPage)
        .limit(perPage);
    }
    return {
      msg: msg.searchUser,
      data: { result, total },
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  searchUser,
  searchGroup,
  searchUserForSubGroup,
  searchUserForMainGroup,
};

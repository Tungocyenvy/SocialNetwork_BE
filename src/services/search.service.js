const Profile = require('../models/profile.model');
const Group = require('../models/group.model');
const userSubGroup = require('../models/user_subgroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const Account = require('../models/account.model');
const Post = require('../models/post.model');
const Company = require('../models/company.model');
const News = require('../models/recruitment_news.model');
const { map, keyBy } = require('lodash');
const moment = require('moment');

const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('search'));
};

const removeVN = (Text) => {
  return Text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const getWeekstoNow=(day,numPost)=>{
  const weeks=Math.ceil(moment.duration(moment().diff(moment(day))).asWeeks());
  return Math.ceil(numPost/weeks);
}

const transferProfile = (profile) => {
  const { _id, fullname, avatar, dob, address, email, phone, year, faculty } = profile||{};
  return {
    userId: _id, fullname, avatar, dob, address, email, phone, year, faculty,
  };
};

//search by name or identify
const searchUser = async (req, lang) => {
  let keyword = req.query.keyword;
  let perPage = 10;
  let { page = 1, isStudent = null } = req.query || {};
  const msg = getMsg(lang);
  try {
    let result;
    let account;
    let profile=[];

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      removeVN(keyword).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;
    if (isStudent === null) { //get all
      total = await Profile.countDocuments({ keyword: key });
    } else {
      if (isStudent === 'true') { //get student
        account = await Account.find({ roleId: 4, isDelete:false });
      } else { //get teacher
        account = await Account.find({ roleId: { $in: [2, 3] },isDelete:false });
      }
      if (account.length > 0) {
        const accountIds = map(account, '_id');
        total = await Profile.countDocuments({ keyword: key, _id: { $in: accountIds } });
      }
    }
    if (total > 0) {
      if (isStudent === null) { //get all
        profile = await Profile.find({ keyword: key })
          .skip(perPage * page - perPage)
          .limit(perPage);
      } else {
        if (isStudent === 'true') { //get student
          account = await Account.find({ roleId: 4, isDelete:false});
        } else { //get teacher
          account = await Account.find({ roleId: { $in: [2, 3] },isDelete:false });
        }
        if (account.length > 0) {
          const accountIds = map(account, '_id');
          profile = await Profile.find({ keyword: key, _id: { $in: accountIds } })
            .skip(perPage * page - perPage)
            .limit(perPage);
        }
      }

      if(profile.length>0)
      {
        const facultyIds =map(profile,'faculty');
        const faculty = await Group.find({_id:{$in:facultyIds}});
        const objFaculty= keyBy(faculty,'_id');
        result= profile.map(item=>{
          const objProfile=item||{};
          const {nameEn,nameVi}=objFaculty[objProfile.faculty]||{};
          return {...objProfile._doc,facultyNameEn:nameEn,facultyNameVi:nameVi};
        })
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

    let profile;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      removeVN(keyword).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;
    const listUser = await userSubGroup.find({ groupId: groupId });
    if (listUser.length <= 0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: {result:[],total:0}
      };
    }

    const userIds = map(listUser, 'userId');
    const account = await Account.find({_id:{$in:userIds},isDelete:false});
    const accountIds=map(account,'_id');
    total = await Profile.countDocuments({ _id: { $in: accountIds, }, keyword: key });
    if (total <= 0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: {result:[],total:0}
      };
    }

    profile = await Profile.find({ _id: { $in: accountIds }, keyword: key })
      .skip(perPage * page - perPage)
      .limit(perPage);

    const result = profile.map((item) => {
      return transferProfile(item);
    });

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
  let { keyword, groupId, page = 1, isStudent = null, isDelete=false } = req.query || {};
  const msg = getMsg(lang);
  try {
    const sub = 'admin';

    let profile;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      removeVN(keyword).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;
    const listUser =
      isStudent === null
        ? await userMainGroup.find({ groupId: groupId })
        : await userMainGroup.find({ groupId: groupId, isStudent: isStudent });
    if (listUser.length <= 0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: []
      };
    }

    const userIds = map(listUser, 'userId');
    const account = await Account.find({_id:{$in:userIds},isDelete:isDelete});
    const accountIds=map(account,'_id');
    total = await Profile.countDocuments({ _id: { $in: accountIds, }, keyword: key });

    if (total <= 0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: {result:[],total:0}
      };
    }
    profile = await Profile.find({ _id: { $in: accountIds, }, keyword: key })
      .skip(perPage * page - perPage)
      .limit(perPage);

    const result = profile.map((item) => {
      return transferProfile(item);
    });

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
      const group = await Group.find({ $or: [{ nameEn: key }, { nameVi: key }], isMain: false })
        .skip(perPage * page - perPage)
        .limit(perPage);

      result =await Promise.all(group.map(async (item)=>{
        const {_id,isMain,createdDate,cateId,image,nameEn,nameVi}=item||{};
        const numMember = await userSubGroup.countDocuments({ groupId: _id });
        const numPost = await Post.countDocuments({groupId:_id})

        return{
          groupId:_id,isMain,createdDate,cateId,image,nameEn,nameVi,numMember,numPost,postPerWeek: getWeekstoNow(createdDate,numPost)
        };
      }));
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
const searcCompany = async (req, lang) => {
  let perPage = 10;
  let { keyword, page = 1, isDelete=false } = req.query || {};
  const msg = getMsg(lang);
  try {
    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      removeVN(keyword).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    const company =await Company.find({ keyword: key });
    if(company.length<=0)
    {
      return {
            msg: msg.notHaveComapny,
            statusCode: 200,
            data: {result:[],total:0}
          };
    }
    const compnayId= map(company,'_id');
    const total= await News.count({companyId:{$in:compnayId}});
    
     if (total <= 0) {
      return {
        msg: msg.notHaveComapny,
        statusCode: 200,
        data: {result:[],total:0}
      };
    }

    const news = await News.find({companyId:{$in:compnayId}})
    .skip(perPage * page - perPage)
    .limit(perPage);

    const objCompany = keyBy(company, '_id');
    result = news.map(item => {
      const fullname = objCompany[item.companyId].fullname;
      return { ...item._doc, fullname };
    })

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
  searcCompany
};

const mongoose = require('mongoose');
const Notify = require('../models/notify_maingroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const Post = require('../models/post.model');
const Reply = require('../models/reply.model');
const Comment = require('../models/comment.model');
const Notification = require('../models/notification.model');
const moment = require('moment');
const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('group'));
};

// const checkGroup= async (body) =>{
//     let {group}=body;
//     if(!group)
//     {
//         return {
//             msg: 'group not found',
//             statusCode: 300,
//           };
//     }
// }

//USER
//add user to group
const addUser = async (body, lang) => {
  let { userId, groupId, type, roleId } = body || {};
  const msg = getMsg(lang);
  try {
    let isStudent = true;
    const account = await Account.findById({_id:userId});
    if(!account)
    {
      return {
        msg: msg.notExists,
        statusCode: 200,
      };
    }
    const roleId= account.roleId;
    if (roleId !== 4) isStudent = false;
    if (!userId || !groupId) {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }
    let data = { userId, groupId, isStudent };
    let countUser = 0;
    try {
      if (type === 'main') {
        countUser = await userMainGroup.countDocuments({
          groupId: groupId,
          userId: userId,
        });
        if (countUser > 0) {
          return {
            msg: msg.existsUser.replace('%s', userId),
            statusCode: 300,
          };
        }
        if(roleId===2 && groupId!='grgv') data.isAdmin=true;
        await userMainGroup.create(data);
      } else {
        countUser = await userSubGroup.countDocuments({
          groupId: groupId,
          userId: userId,
        });
        if (countUser > 0) {
          return {
            msg: msg.existsUser.replace('%s', userId),
            statusCode: 300,
          };
        }
        delete data.isStudent;
        await userSubGroup.create(data);
      }
      return {
        msg: msg.group.replace('%s', userId),
        statusCode: 200,
      };
    } catch {
      return {
        msg: msg.errGroup.replace('%s', userId),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.errGroup.replace('%s', userId),
      statusCode: 300,
    };
  }
};

//delete user from MainGroup
const deleteListUser = async (body, lang) => {
  let { userIds } = body || {};
  const msg = getMsg(lang);
  try {
    if (!userIds) {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }
    await Account.updateMany({
      _id: { $in: userIds }
    }, { $set: { isDelete: true, deletedDate: moment().toDate() } });
    return {
      msg: msg.deleteListUser,
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//Detele user
const deleteUser = async (body, lang) => {
  let { userId, groupId, type } = body || {};
  const msg = getMsg(lang);
  try {
    if (!userId || !groupId) {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }

    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: msg.notFoundGroup,
        statusCode: 300,
      };
    }
    try {
      if (type === 'main') {
        await userMainGroup.findOneAndDelete({
          userId: userId,
          groupId: groupId,
        });
      } else {
        await userSubGroup.findOneAndDelete({
          userId: userId,
          groupId: groupId,
        });
      }
      return {
        msg: msg.deleteUser.replace('%s', userId),
        statusCode: 200,
      };
    } catch {
      return {
        msg: msg.errDelete.replace('%s', userId),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.errDelete.replace('%s', userId),
      statusCode: 300,
    };
  }
};

//FACULTY
//send Notify for maingroup
const sendNotifyForMainGroup = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    await Notify.insertMany(body);
    return {
      msg: msg.sendNotify,
      statusCode: 200,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getListFaculty = async (req, lang) => {
  let perPage = 10;
  let { isAll = true, page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const total = await Group.countDocuments({ isMain: true });
    if (total <= 0) {
      return {
        msg: msg.notHaveMainGr,
        statusCode: 200,
        data:{result:[],total}
      };
    }
    if (isAll===true) perPage = total;
    const listGroupMain = await Group.find({ isMain: true, _id:{$nin:['grsv','grgv']} })
      .sort({_id:-1})
      .skip(perPage * page - perPage)
      .limit(perPage);


    if (listGroupMain.length > 0) {
      const facultyIds = map(listGroupMain,'_id');
      const userGroup = await userMainGroup.find({groupId:{$in:facultyIds},isAdmin:true});
      const userIds = map(userGroup,'userId');
      const profile = await Profile.find({_id:{$in:userIds}});
      const objProfile = keyBy(profile,'faculty');
      const result = listGroupMain.map((item)=>{
        const {_id} = item||{};
        const deanProfile = objProfile[_id]||{};
        return {...item._doc,profile: {...deanProfile._doc}};
      });
      return {
        msg: msg.getListFaculty,
        statusCode: 200,
        data: {result,total},
      };
    } else {
      return {
        msg: msg.notHaveFaculty,
        statusCode: 200,
        data:{result:[],total:0}
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createFaculty = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const faculty = await Group.findById({ _id: body._id });
      if (faculty) {
        return {
          msg: msg.existFac,
          statusCode: 200,
          data: faculty,
        };
      }
      let data = body;
      data.isMain = true;
      await Group.create(data);
      return {
        msg: msg.createFaculty,
        statusCode: 200,
        data: data,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateFaculty = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const res = await Group.findByIdAndUpdate({ _id: body._id }, body);
      if (res) {
        const result = await Group.findById({ _id: body._id });
        return {
          msg: msg.updateFaculty,
          statusCode: 200,
          data: result,
        };
      }
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const tranferFaculty = async (body, lang) => {
  let { facultyTo, facultyFrom, userId } = body || {};
  const msg = getMsg(lang);
  try {
    const sttDelete = (
      await deleteUser({ userId, groupId: facultyFrom, type: 'main' })
    ).statusCode;
    if (sttDelete === 300) {
      return {
        msg: msg.errDelete.replace('%s', userId),
        statusCode: 300,
      };
    }
    const sttAdd = (await addUser({ userId, groupId: facultyTo, type: 'main' }))
      .statusCode;
    if (sttAdd === 300) {
      return {
        msg: msg.errGroup.replace('%s', userId),
        statusCode: 300,
      };
    }

    let profile = await Profile.findById({ _id: userId });
    profile.faculty = facultyTo;
    const res = await profile.save();
    if (res) {
      return {
        msg: msg.tranferFaculty,
        statusCode: 200,
        data: profile,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const changeAdmin = async (body, lang) => {
  let { groupId, userId, type, isRemove } = body || {};
  const msg = getMsg(lang);
  try {
    let user;
    if (type == 'main') {
      user = await userMainGroup.findOne({ userId: userId, groupId: groupId });
      let oldAdmin = await userMainGroup.findOne({groupId: groupId, isAdmin:true,userId:{$nin:userId}});
      if(oldAdmin)
      {
        oldAdmin.isAdmin=false;
        await userMainGroup.findByIdAndUpdate({_id:oldAdmin._id},oldAdmin);
        await Account.findByIdAndUpdate({_id:oldAdmin.userId},{roleId:3});
      }
      await Account.findByIdAndUpdate({_id:userId},{roleId:2});
    } else {
      if (isRemove === true) {
        const total = await userSubGroup.countDocuments({ groupId: groupId, isAdmin: true });
        if (total === 1) {
          return {
            msg: msg.errChangeAdmin,
            statusCode: 300,
          };
        }
      }
      user = await userSubGroup.findOne({ userId: userId, groupId: groupId });
    }

    if (!user) {
      return {
        msg: msg.notFound,
        statusCode: 300,
      };
    }

    user.isAdmin = true;
    if (isRemove===true) user.isAdmin = false;
    await user.save();
    const result = await Profile.findById({_id:userId});
    return {
      msg: msg.changeAdmin,
      statusCode: 200,
      data: result,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//SUBGROUP
const createSubGroup = async (userId, body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const imageDefault =
        'https://res.cloudinary.com/blogreview/image/upload/v1648876903/j0pbzmmrgsomqoywdqde.jpg';

      const data = new Group({
        _id: mongoose.Types.ObjectId(),
        nameEn: body.name,
        nameVi: body.name,
        cateId: body.cateId ? body.cateId : 'none',
        image: body.image ? body.image : imageDefault,
      });
      const res = await data.save();

      if (res) {
        const groupId = res._id;
        const isAdmin = true;
        let dataUser = { userId, groupId, isAdmin };
        await userSubGroup.create(dataUser);
        return {
          msg: msg.createSub,
          statusCode: 200,
          data: data,
        };
      }
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getAllGroup = async (req, lang) => {
  const msg = getMsg(lang);
  try {
    let total = await Group.countDocuments({ isMain: false });
    if (total <= 0) {
      return {
        msg: msg.notHaveSubGr,
        statusCode: 200,
        data:{ total, result:[] }
      };
    }

    const result = await Group.find({ isMain: false })

    return {
      msg: msg.getSub,
      statusCode: 200,
      data: { total, result },
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getRelativeGroup = async (UserID, req, lang) => {
  let { page = 1 } = req.query || {};
  let perPage = 2;
  const msg = getMsg(lang);
  try {
    req.query.isAll = true;
    const rs = (await getGroupByUserId(UserID, req, lang)).data;
    const count = rs.total;
    const listGroup = rs.result;
    let groupIds = [];
    if (count > 0) {
      groupIds = map(listGroup, 'groupId');
    }
    const group = count > 0 ? await Group.find({ _id: { $in: groupIds } }) : [];
    const cateIds = map(group, 'cateId') || '6247e027aafeb586cb35c956';

    let total = await Group.countDocuments({
      isMain: false,
      cateId: { $in: cateIds },
      _id: { $nin: groupIds },
    });
    if (total > 0) {
      const group = await Group.find({
        isMain: false,
        cateId: { $in: cateIds },
        _id: { $nin: groupIds },
      })
        .skip(perPage * page - perPage)
        .limit(perPage);

      const result =await Promise.all(group.map(async (item)=>{
        const {_id,isMain,createdDate,cateId,image,nameEn,nameVi}=item||{};
        const numMember = await userSubGroup.countDocuments({ groupId: _id });
        const numPost = await Post.countDocuments({groupId:_id})

        return{
          _id,isMain,createdDate,cateId,image,nameEn,nameVi,numMember,numPost
        };
      }));
      

      return {
        msg: msg.getRalative,
        statusCode: 200,
        data: { total, result },
      };
    } else {
      return {
        msg: msg.getRalative,
        statusCode: 200,
        data: [],
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateGroup = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const res = await Group.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await Group.findById({ _id: body._id });
      return {
        msg: msg.updateSub,
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

const getListUser = async (req, lang) => {
  let perPage = 10;
  let { page = 1, isStudent = true, isAdmin=false} = req.query || {};
  const msg = getMsg(lang);
  let { type, groupId } = req.params || {};

  try {
    let listUser = [];
    let total = 0;
    if (type === 'main') {
      listUser = await userMainGroup
        .find({ groupId: groupId, isStudent: isStudent,isAdmin:isAdmin})
        .skip(perPage * page - perPage)
        .limit(perPage);
    } else {
      listUser = await userSubGroup
        .find({ groupId: groupId,isAdmin:isAdmin})
        .skip(perPage * page - perPage)
        .limit(perPage);
    }

    if (listUser.length<=0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: {result:[],total:0},
      };
    }

    const objUser = keyBy(listUser,'userId');

    const userIds = map(listUser, 'userId');
    const account = await Account.find({_id:{$in:userIds},isDelete:false});
    if(account.length<=0)
    {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: {result:[],total:0},
      };
    }
    const accountIds= map(account,'_id');
    const profile = await Profile.find({
      _id: {
        $in: accountIds,
      },
    });

    objProfile = keyBy(profile, '_id');

    const result = accountIds.map((item) => {
      const { userId, isAdmin } = objUser[item]||{};
      const { fullname, avatar, dob, address, phone, email, year, faculty } =
        objProfile[userId]||{};
      return {
        userId,
        isAdmin,
        fullname,
        avatar,
        dob,
        address,
        phone,
        email,
        year,
        faculty,
      };
    });
    if(type==='main')
    {
      total = await userMainGroup.countDocuments({userId:{$in:accountIds}, groupId: groupId});
    }else{
      total = await userSubGroup.countDocuments({userId:{$in:accountIds}, groupId: groupId});
    }
    return {
      msg: msg.getUser,
      statusCode: 200,
      data: {result,total}
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getGroupByUserId = async (UserID, req, lang) => {
  let { page = 1, isAll = false } = req.query || {};
  let perPage = 5;
  const msg = getMsg(lang);
  try {
    let total = await userSubGroup.countDocuments({ userId: UserID });
    let result = [];
    if (total > 0) {
      if (isAll === true) {
        perPage = total;
        page = 1;
      }
      const group = await userSubGroup
        .find({ userId: UserID })
        .sort({ _id: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage);

      const groupIds = map(group, 'groupId');
      const lstGroup = await Group.find({
        _id: {
          $in: groupIds,
        },
      });

      const objGroup = keyBy(lstGroup, '_id');
      result =await Promise.all( group.map(async (item) => {
        const { groupId, isAdmin } = item||{};
        const { nameEn, nameVi, createdDate, cateId, image } =
          objGroup[groupId]||{};
        const numMember = await userSubGroup.countDocuments({ groupId: groupId });
        const numPost = await Post.countDocuments({groupId:groupId})
        return { groupId, nameEn, nameVi, createdDate, cateId, image, isAdmin,numMember, numPost};
      }));
      return {
        msg: msg.getSub,
        statusCode: 200,
        data: { total, result },
      };
    } else {
      return {
        msg: msg.notHaveSubGr,
        statusCode: 200,
        data: { total, result },
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getDetailGroup = async (req, lang) => {
  let { groupId } = req.params || {};
  const msg = getMsg(lang);
  try {
    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: msg.notFoundGroup,
        statusCode: 300,
      };
    }
    const numMember = await userSubGroup.countDocuments({ groupId: groupId });
    const numPost = await Post.countDocuments({ groupId: groupId });
    return {
      msg: msg.getDetailGr,
      statusCode: 200,
      data: { group, numMember, numPost },
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const checkAdminforSub = async (userID,req, lang) => {
  let { groupId } = req.query || {};
  const msg = getMsg(lang);
  try {
    const user = await userSubGroup.findOne({userId:userID,groupId:groupId});
    const isAdmin = user?user.isAdmin:false;
    return {
      msg: msg.checkAdmin,
      statusCode: 200,
      data:isAdmin
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getFacultyByUserId = async (UserID, req, lang) => {
  const msg = getMsg(lang);
  try {
    const profile  = await Profile.findById({_id:UserID});
    if(!profile)
    {
      return {
        msg: msg.notFoundUser,
        statusCode: 300,
      };
    }

    const faculty = profile.faculty;
    const group = await Group.findOne({_id:faculty,isMain:true});
    let result=[];
    result.push(group);
   
      return {
        msg: msg.getListFaculty,
        statusCode: 200,
        data: {result},
      };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const deleteGroup = async (req, lang) => {
  let{groupId} = req.query||{}
  const msg = getMsg(lang);
  try {
    const group = await Group.findById({_id:groupId});
    if (group) {
      const post = await Post.find({groupId:groupId});
      if(post.length>0)
      {
        const postIds = map(post, '_id');
        const comment = await Comment.find({ postId: {$in:postIds}});
        if (comment.length > 0) {
          const commentIds = map(comment, '_id');
          await Reply.deleteMany({ commentId: { $in: commentIds } });
          await Comment.deleteMany({ _id: {$in:commentIds} });
        }
        await Post.deleteMany({ _id: {$in:postIds} });
      }
      await Notification.deleteMany({ groupId: groupId });
      await Notify.deleteMany({ groupId: groupId});
      await Group.findByIdAndDelete({_id:groupId});
      return {
        msg: msg.deleteGroup,
        statusCode: 200,
        data: {}
      };
    }else{
      return {
        msg: msg.notFoundGroup,
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
}

const getListGroupForAminSub = async (UserID,req,lang) => {
  const msg = getMsg(lang);
  // check account
    try {
      let result=[];
      let total=0;
      const group = await userSubGroup.find({userId:UserID,isAdmin:true});
      if(group.length<=0)
      {
        return {
          msg: msg.notHaveSubGr,
          statusCode: 200,
          data: {total,result}
        };
      }
      groupIds=map(group,'groupId');
      result = await Group.find({_id:{$in:groupIds}});
      total = result.length;
      return {
        msg: msg.getSub,
        statusCode: 200,
        data: {total,result}
      };
    } catch {
      return {
        msg: msg.err,
        statusCode: 300,
      };
    }
};

module.exports = {
  addUser,
  sendNotifyForMainGroup,
  deleteUser,
  deleteListUser,
  getListFaculty,
  tranferFaculty,
  createFaculty,
  changeAdmin,
  createSubGroup,
  getRelativeGroup,
  getAllGroup,
  updateGroup,
  updateFaculty,
  getListUser,
  getGroupByUserId,
  getDetailGroup,
  checkAdminforSub,
  getFacultyByUserId,
  deleteGroup,
  getListGroupForAminSub
};

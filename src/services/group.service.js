const mongoose = require('mongoose');
const Notify = require('../models/notify_maingroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const Post = require('../models/post.model');
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
    if (roleId != null && roleId !== 4) isStudent = false;
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
            msg: msg.existsUser.replace('%s', userId).replace('%s', groupId),
            statusCode: 300,
          };
        }
        await userMainGroup.create(data);
      } else {
        countUser = await userSubGroup.countDocuments({
          groupId: groupId,
          userId: userId,
        });
        if (countUser > 0) {
          return {
            msg: msg.existsUser.replace('%s', userId).replace('%s', groupId),
            statusCode: 300,
          };
        }
        delete data.isStudent;
        await userSubGroup.create(data);
      }
      return {
        msg: msg.group.replace('%s', userId).replace('%s', groupId),
        statusCode: 200,
      };
    } catch {
      return {
        msg: msg.errGroup.replace('%s', userId).replace('%s', groupId),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.errGroup.replace('%s', userId).replace('%s', groupId),
      statusCode: 300,
    };
  }
};

//delete user from MainGroup
const deleteListUser = async (body, lang) => {
  let { userIds, groupId, type } = body || {};
  const msg = getMsg(lang);
  try {
    if (!userIds || !groupId) {
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
        await userMainGroup.deleteMany({
          userId: { $in: userIds },
          groupId: groupId,
        });
      } else {
        await userSubGroup.deleteMany({
          userId: { $in: userIds },
          groupId: groupId,
        });
      }
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
        msg: msg.deleteUser.replace('%s', userId).replace('%s', groupId),
        statusCode: 200,
      };
    } catch {
      return {
        msg: msg.errDelete.replace('%s', userId).replace('%s', groupId),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.errDelete.replace('%s', userId).replace('%s', groupId),
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
        statusCode: 300,
      };
    }
    if (isAll) perPage = total;
    const listGroupMain = await Group.find({ isMain: true })
      .skip(perPage * page - perPage)
      .limit(perPage);

    const result = listGroupMain.filter(
      (x) => x._id !== 'grsv' && x._id != 'grgv',
    );
    if (result.length > 0) {
      return {
        msg: msg.getListFaculty,
        statusCode: 200,
        data: result,
      };
    } else {
      return {
        msg: msg.notHaveFaculty,
        statusCode: 300,
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
    console.log(sttDelete);
    if (sttDelete === 300) {
      return {
        msg: msg.errDelete.replace('%s', userId).replace('%s', facultyFrom),
        statusCode: 300,
      };
    }
    const sttAdd = (await addUser({ userId, groupId: facultyTo, type: 'main' }))
      .statusCode;
    if (sttAdd === 300) {
      return {
        msg: msg.errGroup.replace('%s', userId).replace('%s', facultyTo),
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
    let user = {};
    if (type == 'main') {
      user = await userMainGroup.findOne({ userId: userId, groupId: groupId });
    } else {
      user = await userSubGroup.findOne({ userId: userId, groupId: groupId });
    }

    if (!user) {
      return {
        msg: msg.notFound,
        statusCode: 300,
      };
    }

    user.isAdmin = true;
    if (isRemove) user.isAdmin = false;
    await user.save();
    if (type != 'main')
      await Account.findByIdAndUpdate({ _id: userId }, { isAdminSG: true });
    return {
      msg: msg.changeAdmin.replace('%s', groupId),
      statusCode: 200,
      data: user,
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
        await Account.findByIdAndUpdate({ _id: userId }, { isAdminSG: true });
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
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    let total = await Group.countDocuments({ isMain: false });
    if (total <= 0) {
      return {
        msg: msg.notHaveSubGr,
        statusCode: 300,
      };
    }

    const result = await Group.find({ isMain: false })
      .skip(perPage * page - perPage)
      .limit(perPage);

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
    const data = (await getGroupByUserId(UserID, req, lang)).data;
    const count = data.total;
    const listGroup = data.result;
    let groupIds = [];
    if (count > 0) {
      groupIds = map(listGroup, 'groupId');
    }
    const group = count > 0 ? await Group.find({ _id: { $in: groupIds } }) : [];
    // if (!group) {
    //   return {
    //     msg: msg.notFoundGroup,
    //     statusCode: 300,
    //   };
    // }
    const cateIds = map(group, 'cateId') || '6247e027aafeb586cb35c956';

    let total = await Group.countDocuments({
      isMain: false,
      cateId: { $in: cateIds },
      _id: { $nin: groupIds },
    });
    if (total > 0) {
      const result = await Group.find({
        isMain: false,
        cateId: { $in: cateIds },
        _id: { $nin: groupIds },
      })
        .skip(perPage * page - perPage)
        .limit(perPage);

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
  let { page = 1, isStudent = true} = req.query || {};
  const msg = getMsg(lang);
  let { type, groupId } = req.params || {};

  try {
    let listUser = [];
    let total = 0;
    if (type === 'main') {
      total = await userMainGroup.countDocuments({
        groupId: groupId,
        isStudent: isStudent,
      });
      listUser = await userMainGroup
        .find({ groupId: groupId, isStudent: isStudent})
        .skip(perPage * page - perPage)
        .limit(perPage);
    } else {
      total = await userSubGroup.countDocuments({ groupId: groupId});
      listUser = await userSubGroup
        .find({ groupId: groupId})
        .skip(perPage * page - perPage)
        .limit(perPage);
    }

    if (total == 0) {
      return {
        msg: msg.notHaveUser,
        statusCode: 200,
        data: [],
      };
    }

    const userIds = map(listUser, 'userId');
    const profile = await Profile.find({
      _id: {
        $in: userIds,
      },
    });

    objProfile = keyBy(profile, '_id');

    const result = listUser.map((item) => {
      const { userId, isAdmin } = item;
      const { fullname, avatar, dob, address, phone, email, year, faculty } =
        objProfile[userId];
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
      result = group.map((item) => {
        const { groupId, isAdmin } = item;
        const { nameEn, nameVi, createdDate, cateId, image } =
          objGroup[groupId];
        return { groupId, nameEn, nameVi, createdDate, cateId, image, isAdmin };
      });
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
};

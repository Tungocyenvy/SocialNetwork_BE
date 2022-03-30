const mongoose = require('mongoose');
const Notify = require('../models/notify_maingroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');

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
const addUser = async (body) => {
  let { userId, groupId, type, role } = body || {};
  try {
    let isStudent = true;
    if (role != null && role !== 'student') isStudent = false;
    if (!userId || !groupId) {
      return {
        msg: "Don't have userId or groupId",
        statusCode: 300,
      };
    }
    let data = { userId, groupId, isStudent };

    try {
      if (type === 'main') {
        await userMainGroup.create(data);
      } else {
        delete data.isStudent;
        await userSubGroup.create(data);
      }
      return {
        msg: 'Add ' + userId + ' to ' + groupId + ' successful!',
        statusCode: 200,
      };
    } catch {
      return {
        msg:
          'An error occurred during add ' +
          userId +
          ' to group ' +
          groupId +
          ' process',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg:
        'An error occurred during add ' +
        userId +
        ' to group ' +
        groupId +
        ' process',
      statusCode: 300,
    };
  }
};

//delete user from MainGroup
const deleteListUser = async (body) => {
  let { userIds, groupId, type } = body || {};
  try {
    if (!userIds || !groupId) {
      return {
        msg: "Don't have userIds or groupId",
        statusCode: 300,
      };
    }
    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: 'GroupId not found!',
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
        msg: 'delete list user ' + userIds + ' successful!',
        statusCode: 200,
      };
    } catch {
      return {
        msg: 'An error occurred during delete list user process',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during delete list user process',
      statusCode: 300,
    };
  }
};

//Detele user
const deleteUser = async (body) => {
  let { userId, groupId, type } = body || {};
  try {
    if (!userId || !groupId) {
      return {
        msg: "Don't have userId or groupId",
        statusCode: 300,
      };
    }

    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: 'GroupId ' + groupId + ' not found!',
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
        msg: 'delete ' + userId + ' from ' + groupId + ' successful!',
        statusCode: 200,
      };
    } catch {
      return {
        msg:
          'An error occurred during delete ' +
          userId +
          ' from group ' +
          groupId +
          ' process',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg:
        'An error occurred during delete ' +
        userId +
        ' from group ' +
        groupId +
        ' process',
      statusCode: 300,
    };
  }
};

//FACULTY
//send Notify for maingroup
const sendNotifyForMainGroup = async (body) => {
  try {
    await Notify.insertMany(body);
    return {
      msg: 'send notify susscessful',
      statusCode: 200,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during send notify to user ',
      statusCode: 300,
    };
  }
};

const getListFaculty = async () => {
  try {
    const listGroupMain = await Group.find({ isMain: true });
    if (listGroupMain.length <= 0) {
      return {
        msg: "Don't have main group",
        statusCode: 300,
      };
    }

    const result = listGroupMain.filter(
      (x) => x._id !== 'grsv' && x._id != 'grgv',
    );
    if (result.length > 0) {
      return {
        msg: 'get list faculty susscessful',
        statusCode: 200,
        data: result,
      };
    } else {
      return {
        msg: "Don't have any faculty",
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during get list faculty',
      statusCode: 300,
    };
  }
};

const createFaculty = async (body) => {
  try {
    if (body) {
      const faculty = await Group.findById({ _id: body._id });
      if (faculty) {
        return {
          msg: 'faculty identifier is exist!',
          statusCode: 200,
          data: faculty,
        };
      }
      let data = body;
      data.isMain = true;
      await Group.create(data);
      return {
        msg: 'Create faculty successful!',
        statusCode: 200,
        data: data,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during create faculty',
      statusCode: 300,
    };
  }
};

const tranferFaculty = async (body) => {
  let { facultyTo, facultyFrom, userId } = body || {};
  try {
    const sttDelete = (
      await deleteUser({ userId, groupId: facultyFrom, type: 'main' })
    ).statusCode;
    console.log(sttDelete);
    if (sttDelete === 300) {
      return {
        msg:
          'An error occurred during delete ' +
          userId +
          ' from group ' +
          facultyFrom +
          ' process',
        statusCode: 300,
      };
    }
    const sttAdd = (await addUser({ userId, groupId: facultyTo, type: 'main' }))
      .statusCode;
    if (sttAdd === 300) {
      return {
        msg:
          'An error occurred during add ' +
          userId +
          ' to group ' +
          facultyTo +
          ' process',
        statusCode: 300,
      };
    }

    let profile = await Profile.findById({ _id: userId });
    profile.faculty = facultyTo;
    const res = await profile.save();
    if (res) {
      return {
        msg: 'Inter-Faculty Transfer successful!',
        statusCode: 200,
        data: profile,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during tranfer faculty',
      statusCode: 300,
    };
  }
};

const changeAdmin = async (body) => {
  let { groupId, userId, type, isRemove } = body || {};
  try {
    let user = {};
    if (type == 'main') {
      user = await userMainGroup.findOne({ userId: userId, groupId: groupId });
    } else {
      user = await userSubGroup.find({ userId: userId, groupId: groupId });
    }

    if (!user) {
      return {
        msg: 'user not found in group',
        statusCode: 300,
      };
    }

    user.isAdmin = true;
    if (isRemove) user.isAdmin = false;
    await user.save();

    return {
      msg: 'change admin for group ' + groupId + ' successful!',
      statusCode: 200,
      data: user,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during change admin for  group ' + groupId,
      statusCode: 300,
    };
  }
};

//SUBGROUP
const createSubGroup = async (userId, body) => {
  try {
    if (body) {
      let data = body;
      data._id = mongoose.Types.ObjectId();
      data.isMain = false;

      console.log(data);

      const res = await Group.create(data);
      console.log(res);

      if (res) {
        const groupId = res._id;
        const isAdmin = true;
        let dataUser = { userId, groupId, isAdmin };
        await userSubGroup.create(dataUser);
        return {
          msg: 'Create faculty successful!',
          statusCode: 200,
          data: data,
        };
      }
    }
  } catch (err) {
    return {
      msg: 'An error occurred during create faculty',
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
};

const Notify = require('../models/notify_maingroup.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');

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

//add user to group
const addUser = async (body) => {
  let { userId, groupId, type, role } = body || {};
  try {
    let isStudent = true;
    if (role != null && role !== 'student') isStudent = false;
    if (!userId || !groupId) {
      return {
        msg: 'Not have userId or groupId',
        statusCode: 300,
      };
    }
    const data = { userId, groupId, isStudent };

    try {
      if (type === 'main') {
        await userMainGroup.create(data);
      } else {
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
        msg: 'Not have userIds or GroupId!',
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
        msg: 'Not have userId or GroupId!',
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
        msg: 'Not have dara',
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
        msg: 'No have data',
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

module.exports = {
  addUser,
  sendNotifyForMainGroup,
  deleteUser,
  deleteListUser,
  getListFaculty,
};

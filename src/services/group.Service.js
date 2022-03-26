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
  let { userId, groupId, type, role } = body;
  try {
    let isStudent = true;
    if (role !== 'student') isStudent = false;
    const data = { userId, groupId, isStudent };
    switch (type) {
      case 'main': {
        await userMainGroup.create(data);
        break;
      }
      default: {
        await userSubGroup.create(data);
        break;
      }
    }
    return {
      msg: 'Add ' + _id + ' to ' + groupId + ' successful!',
      statusCode: 200,
    };
  } catch {
    return {
      msg:
        'An error occurred during add ' +
        _id +
        ' to group ' +
        groupId +
        ' process',
      statusCode: 300,
    };
  }
};

//delete user from MainGroup
const deleteListUser = async (body) => {
  let { userIds, groupId, type } = body;
  try {
    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: 'GroupId not found!',
        statusCode: 300,
      };
    }

    switch (type) {
      case 'main': {
        await userMainGroup.deleteMany({
          userId: { $in: userIds },
          groupId: groupId,
        });
        break;
      }
      default: {
        await userSubGroup.deleteMany({
          userId: { $in: userIds },
          groupId: groupId,
        });
        break;
      }
    }
    return {
      msg: 'delete list user successful!',
      statusCode: 200,
    };
  } catch {
    return {
      msg: 'An error occurred during delete list user process',
      statusCode: 300,
    };
  }
};

//Detele user
const deleteUser = async (body) => {
  let { userId, groupId, type } = body;
  try {
    const group = await Group.findById({ _id: groupId });
    if (!group) {
      return {
        msg: 'GroupId not found!',
        statusCode: 300,
      };
    }
    switch (type) {
      case 'main': {
        await userMainGroup.findOneAndDelete({
          userId: userId,
          groupId: groupId,
        });
        break;
      }
      default: {
        await userSubGroup.findOneAndDelete({
          userId: userId,
          groupId: groupId,
        });
        break;
      }
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

module.exports = {
  addUser,
  sendNotifyForMainGroup,
  deleteUser,
  deleteListUser,
};

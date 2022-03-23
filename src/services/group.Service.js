const MainGroup = require('../models/maingroup.Model');
const SubGroup = require('../models/subgroup.Model');
const Notify = require('../models/notify_maingroup.Model');
const Account = require('../models/account.Model');

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
  let { _id, groupId, type, role } = body;
  try {
    let group;
    switch (type) {
      case 'main': {
        group = await MainGroup.findById({ _id: groupId });
        if (!group) {
          return {
            msg: 'group not found',
            statusCode: 300,
          };
        }
        group.listUserId[0].push(_id);
        await MainGroup.findByIdAndUpdate({ _id: groupId }, group);
        break;
      }
      case 'fac': {
        group = await MainGroup.findById({ _id: groupId });
        if (!group) {
          return {
            msg: 'group not found',
            statusCode: 300,
          };
        }
        //faculity group: [0] student, [1] teacher
        if (role === 'student') {
          group.listUserId[0].push(_id);
        } else {
          group.listUserId[1].push(_id);
        }
        await MainGroup.findByIdAndUpdate({ _id: groupId }, group);
        break;
      }
      default: {
        group = await SubGroup.findById({ _id: groupId });
        if (!group) {
          return {
            msg: 'group not found',
            statusCode: 300,
          };
        }
        group.listUserId.push(_id);
        await SubGroup.findByIdAndUpdate({ _id: groupId }, group);
        break;
      }
    }
    // await group.save();
    console.log(group);
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

//send Notify for maingroup
const sendNotifyForMainGroup = async (body) => {
  let { userId, postId, groupId } = body;
  try {
    const account = await Account.findById({ _id: userId });
    if (!account) {
      return {
        msg: 'User ' + userId + ' not found!',
        statusCode: 300,
      };
    }

    const newNotify = new Notify({
      userId,
      postId,
      groupId,
    });
    const res = await newNotify.save();
    if (res) {
      return {
        msg: 'send notify to user ' + userId + ' successful!',
        statusCode: 200,
        data: res,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during send notify to user ' + userId,
      statusCode: 300,
    };
  }
};

module.exports = {
  addUser,
  sendNotifyForMainGroup,
};

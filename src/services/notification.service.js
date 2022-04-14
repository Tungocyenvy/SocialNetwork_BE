const notifyQueue = require('../models/notify_queue.model');
const notifyTemplate = require('../models/notify_template.model');
const notifySend = require('../models/notify_send.model');
const userSubGroup = require('../models/user_subgroup.model');
const Profile = require('../models/profile.model');
const Group = require('../models/group.model');
const Reply = require('../models/reply.model');
const Comment = require('../models/comment.model');
const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('notify'));
};

const getId = (code, object) => {
  let _id = '';
  //get lastId
  let lastedId = object[object.length - 1]._id;
  var str = lastedId.match(/[0-9]+$/);
  //increment Id
  var str2 = Number(str ? str[0] : 0) + 1;
  if (str2 < 10) {
    _id = code + str2;
  } else {
    _id = code + str2;
  }
  return _id;
};

/*TEMPLATE*/
//CRUD
const createTemplate = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const checkName = await notifyTemplate.find({
        $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      });
      if (checkName.length > 0) {
        return {
          msg: msg.existsTemplate,
          statusCode: 300,
        };
      }
      let data = body;
      const template = await notifyTemplate.find({});
      data._id = 'TL01';
      if (template.length > 0) {
        data._id = getId('TL', template);
      }
      const res = await notifyTemplate.create(data);
      if (res) {
        return {
          msg: msg.createTemplate,
          statusCode: 200,
          data: res,
        };
      }
    } else {
      return {
        msg: msg.validator,
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

const getTemplate = async (lang) => {
  const msg = getMsg(lang);
  try {
    const template = await notifyTemplate.find({});

    if (template.length <= 0) {
      return {
        msg: msg.notHaveTemplate,
        statusCode: 200,
        data: [],
      };
    }

    return {
      msg: msg.getTemplate,
      statusCode: 200,
      data: template,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateTemplate = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const template = await notifyTemplate.findByIdAndUpdate(
      { _id: body._id },
      body,
    );
    if (template) {
      const result = await notifyTemplate.findById({ _id: body._id });
      return {
        msg: msg.updateTemplate,
        statusCode: 200,
        data: result,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const deleteTemplate = async (req, lang) => {
  const msg = getMsg(lang);
  let { templateId } = req.query || {};
  try {
    const template = await notifyTemplate.findByIdAndDelete({
      _id: templateId,
    });

    if (template) {
      const result = await notifyTemplate.find({});
      return {
        msg: msg.deleteTemplate,
        statusCode: 200,
        data: result,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createNotifyQueue = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const result = await notifyQueue.create(body);
    return {
      msg: msg.createQueue,
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

/**1:add friend
 * 2:comment - representId:commentId - receiverId:Author Post
 * 3: reply - representId:replyId - receiverId:Author Comment
 * 4: createPost - representId:PostId  - receiverId:user in group
 * 5: replyFollow - representId:replyId  - receiverId:commentId (user reply in comment)
 */
const createNotify = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    let data = body;
    const type = body.type;
    const templateId = await notifyTemplate.findOne({ type: type });
    data.templateId = templateId;
    delete data.type;
    let result;
    let userIds = [];
    if(type==='replyFollow'){//receiverId: commentId
      const comment = await Comment.findById({_id:data.receiverId});
      const autComment = comment.userId;
      const exceptUser=[data.senderId,autComment];
      let notify = await notifySend.findOne({senderId:data.senderId,receiverId:data.receiverId});
      if(notify)
      {
        notify.createdDate = Date.now;
        await notifySend.findByIdAndUpdate({_id:notify._id},notify);
        await notifyQueue.updateMany({notifyId:notify._id,userId:{$nin:data.senderId}},{$set:{isRead:false,createdDate:Date.now}});
        
        //first receive notify
       const lstQueue = notifyQueue.find({notifyId:notify._id});
       let listUser=[];
       if(lstQueue.length>0) {listUser = map(lstQueue,'userId');}
       listUser.push(autComment);
       const listReply = await Reply.find({commentId:data.receiverId,userId:{$nin:listUser}});
       if(listReply.length>0) userIds = map(listReply,'userId');
      }else{//first reply
        const rs=await notifySend.create(data);
        await notifyQueue.updateMany({notifyId:rs._id,userId:{$nin:data.senderId}},{$set:{isRead:false,createdDate:Date.now}});
      }
    }
    else if (type === 'createPost') {
      result = await notifySend.create(data);
      const listUser = await userSubGroup.find({
        groupId: body.receiverId,
        userId: { $nin: body.senderId },
      });
      if (listUser.length > 0) {
        userIds = map(listUser, 'userId');
      }
    // }else if(type==='reply')
    // {
    //   const existNotify = await notifySend.find({senderId:data.senderId,receiverId:data.receiverId,representId:data.representId});
    } else {
      result = await notifySend.create(data);
      userIds.push(body.receiverId);
    }

    if (userIds.length > 0) {
      const queue = userIds.map((id) => {
        const userId = id;
        const notifyId = result._id;
        return { userId, notifyId };
      });

      const res = await notifyQueue.insertMany(queue);
    }

    return {
      msg: msg.createNotify,
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

const getNotify = async (userID, req, lang) => {
  let perPage = 10;
  let { page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const total = await notifyQueue.countDocuments({ userId: userID });
    if (total <= 0) {
      return {
        msg: msg.notHaveNotify,
        statusCode: 200,
        data: [],
      };
    }

    const queue = await notifyQueue
      .find({ userId: userID })
      .sort({
        createdDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const objQueue = keyBy(queue, 'notifyId');

    const notifyIds = map(queue, 'notifyId');
    const notify = await notifySend.find({ _id: { $in: notifyIds } });
    objNotify = keyBy(notify, '_id');

    const templateIds = map(notify, 'templateId');
    const template = await notifyTemplate.find({ _id: { $in: templateIds } });
    const objTemplate = keyBy(template, '_id');

    const senderIds = map(notify, 'senderId');
    const profile = await Profile.find({ _id: { $in: senderIds } });
    const objProfile = keyBy(profile, '_id');

    const receiverIds = map(notify, 'receiverId');
    const group = await Group.find({ _id: receiverIds });
    let objgroup = group.length > 0 ? keyBy(group, '_id') : [];
    const result =await Promise.all(notifyIds.map(async(item) => {
      const { notifyId, isRead } = objQueue[item];
      const { templateId, senderId, receiverId,type } = objNotify[item];
      const { nameEn, nameVi } = objTemplate[templateId];
      const { fullname, avatar } = objProfile[senderId];
      let groupName = '';
      if (receiverId != userID) {
        //create post in group
        groupName = objgroup[receiverId].nameEn; //sub group nameEn same nameVi
      }
      let senderEn=fullname;
      let senderVi=fullname;
      if(type==='replyFollow'||type==='reply') //count by commentId
      {
        const total = await notifySend.countDocuments({receiverId:receiverId,senderId:{$nin:senderId}});
        if(total>0) {
          senderVi=sender + " và " +total+" người khác";
          senderVi=sender + " and " +total+" another";
        }
      }
      const contentEn = senderEn + ' ' + nameEn + ' ' + groupName;
      const contentVi = senderVi + ' ' + nameVi + ' ' + groupName;

      return { notifyId, contentEn, contentVi, avatar, isRead };
    }));
    return {
      msg: msg.getNotify,
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

const readNotify = async (userID, req, lang) => {
  let { notifyId } = req.query || {};
  const msg = getMsg(lang);
  try {
    const res = await notifyQueue.findOneAndUpdate(
      { notifyId: notifyId, userId: userID },
      { isRead: true },
    );
    if (res) {
      return {
        msg: msg.readNotify,
        statusCode: 200,
        data: [],
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const deleteNotify = async (req, lang) => {
  let { representId } = req.query || {};
  const msg = getMsg(lang);
  try {
    const notify = await notifySend.find({representId:representId});
    if(notify.length>0)
    {
      const notifyIds = map(notify,'_id');
      await notifyQueue.deleteMany({notifyId:{$in:notifyIds}});
      await notifySend.deleteMany({representId:representId});

      return {
        msg: msg.deleteNotify,
        statusCode: 200,
      };
    }
    return {
      msg: msg.notFound,
      statusCode: 300,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  createNotifyQueue,
  createNotify,
  getNotify,
  readNotify,
  deleteNotify
};

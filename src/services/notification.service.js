const notifyTemplate = require('../models/notify_template.model');
const userSubGroup = require('../models/user_subgroup.model');
const Profile = require('../models/profile.model');
const Group = require('../models/group.model');
const Reply = require('../models/reply.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Notification = require('../models/notification.model');
// const socket = require('../../socket');
const { map, keyBy,groupBy,uniq } = require('lodash');
const I18n = require('../config/i18n');
const moment = require('moment');

const EVENT_NOTIFICATION_SSC = require('../sockets/events/server/notification');

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

/**1:add friend
 * 2:comment -postId, commentId, receiverId:Author Post
 * 3: reply - postId, commentId, replyId - receiverId:Author Comment
 * 4: createPost - postId, groupId (delete groupId)
 * 5: replyFollow - postId, commentId, replyId  
 */
 const createNotify = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    let data = body;
    const type = body.type;
    const templateId = await notifyTemplate.findOne({ type: type });
    data.templateId = templateId._id;
    delete data.type;
    let result={};
    let userIds = [];
    let tmp=[];
    let tmpUser=[]; //for send notify
          /** 
           * 0. createPost -> case createPost
       * 1. comment -> case comment
       * 2. Người reply duy nhất -> case reply (chủ cmt), comment (chủ post)
       * 3. tác giả comment reply -> case replyFollow 
       * 4. Những người reply khác -> 2 case: reply(chủ cmt), replyFollow (receive những người reply cmt)
       */
    switch(type){
      case 'replyFollow':{
        /**
         * 1.User đã reply trước đó rồi và giờ reply ->update notify
         * 2.User lần đầu reply -> tạo notify 
         * 3. reply nhưng chưa nhận thông báo nào -> thêm notify 
         */
        const comment = await Comment.findById({ _id: data.commentId});
        const autComment = comment.userId;
        const post = await Post.findById({_id:data.postId});
        const authPost = post.author;
        const exceptUser = [data.senderId, autComment,authPost];
        let notify = await Notification.find({ senderId: data.senderId, commentId: data.commentId, postId:data.postId });
        if (notify.length>0) {
          //replied before (1)
          const notifyIds =map(notify, '_id');
          await Notification.updateMany({ _id:{$in:notifyIds}, receiverId: { $nin: exceptUser } }, { $set: { isRead: false, createdDate: moment().toDate(),replyId:data.replyId } });
          tmp=await Notification.find({_id:{$in:notifyIds}, receiverId: { $nin: exceptUser } });
          result = notifyIds[0];
          const receiverIds= map(Notification,'receiverId');
          //first receive notify (3)
          let listUser = map(notify,'receiverId');
          listUser.push(autComment);
          listUser.push(data.senderId);
          listUser.push(authPost);
          const listReply = await Reply.find({ commentId: data.commentId, userId: { $nin: listUser } });
          if (listReply.length > 0) {
            userIds = map(listReply, 'userId');
            tmpUser = map(listReply, 'userId');
          }
          tmpUser.push(receiverIds);
        } else {//first reply (2)
          const lstReply = await Reply.find({ commentId: data.commentId,userId:{$nin:exceptUser} });
          if (lstReply.length > 0) {userIds = map(lstReply, 'userId'); tmpUser = map(lstReply, 'userId');}
        }
        break;
      }
      case 'comment':
        {
          let notifyComment = await Notification.findOne({ senderId: data.senderId, receiverId: data.receiverId,postId:data.postId });
          if(notifyComment)
          {
            notifyComment.createdDate = Date.now;
            notifyComment.commentId=data.commentId;
            notifyComment.isRead =false;
            await Notification.findByIdAndUpdate({_id:notifyComment._id},notifyComment);
            result = notifyComment._id;
            tmpUser.push(notifyComment.receiverId);
          }else{
            const tmp=await Notification.create(data);
            result = tmp._id;
            tmpUser.push(data.receiverId);
          }

          break;
        }
        case 'reply':
        {
          let notifyReply = await Notification.findOne({ senderId: data.senderId, commentId:data.commentId,receiverId:data.receiverId});
          if(notifyReply)
          {
            notifyReply.createdDate = Date.now;
            notifyReply.replyId = data.replyId;
            notifyReply.isRead=false;
            await Notification.findByIdAndUpdate({_id:notifyReply._id},notifyReply);
            result = notifyReply._id;
            tmpUser.push(notifyReply.receiverId);
          }else{
            const rsNotify =await Notification.create(data);
            result=rsNotify._id;
            tmpUser.push(data.receiverId);
          }
          break;
        }
      default: //createPost
        {
          const listUser = await userSubGroup.find({
            groupId: data.groupId,
            userId: { $nin: data.senderId },
          });
          if (listUser.length > 0) {
            userIds = map(listUser, 'userId');
            tmpUser =map(listUser, 'userId');
          }
          break;
        } 
    }

    if (userIds.length > 0) {
      let uniqueId=  uniq(userIds);
      const queue = uniqueId.map((id) => {
        const {postId,groupId,senderId,templateId,commentId,replyId}=data||{};
        const receiverId = id;

        return {postId,groupId,senderId,templateId,commentId,replyId,receiverId};
      });
      const res = await Notification.insertMany(queue);
      result=res[0]._id;
    }

    let payload = (await getNotify(result)).data||{};
    payload.userIds=uniq(tmpUser)||[];

    if (payload.userIds.length > 0) {
      global.io.to(payload.userIds).emit(EVENT_NOTIFICATION_SSC.SEND_NOTIFICATION_SSC, {
        data: payload,
        msg: 'send notification room success',
        status: 200,
      });
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

/**
 * 1. comment: tác giả comment 1 người reply -> ... đã phản hồi bình luận của bạn
 *  2 người reply trở lên -> ...(reply mới nhất) và n người khác đã phản hồi bình luận của bạn
 * 2.reply: ... đã phản hồi một bình luận bạn đang theo dõi
 * author Post .... và n người khác đã bình luận bài viết của bạn
 */
const getNotifyByUserId = async (userID, req, lang) => {
  let perPage = 10;
  let { page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const total = await Notification.countDocuments({ receiverId: userID });
    if (total <= 0) {
      return {
        msg: msg.notHaveNotify,
        statusCode: 200,
        data: [],
      };
    }

    const allNotify = await Notification
    .aggregate([  { $match:{ "receiverId": userID }},
      {$sort:{createdDate:-1}}, //sort for group by
      { $group:{_id:{templateId:"$templateId",postId:"$postId",commentId:"$commentId"},
      count : {$sum : 1},
      data : {$push : "$$ROOT"}}},
    {$sort:{data:-1}}]) //sort for return
      .skip(perPage * page - perPage)
      .limit(perPage);
 

    const notify =allNotify.map(x=>{
      let data=x.data[0]||{};
      data.count = x.count||0;
      return data;
    });

    const notifyIds = map(notify, '_id');
    objNotify = keyBy(notify, '_id');

    const templateIds = map(notify, 'templateId');
    const template = await notifyTemplate.find({ _id: { $in: templateIds } });
    const objTemplate = keyBy(template, '_id');

    const senderIds = map(notify, 'senderId');
    const profile = await Profile.find({ _id: { $in: senderIds } });
    const objProfile = keyBy(profile, '_id');

    const groupIds = map(notify, 'groupId');
    const group = await Group.find({ _id: {$in:groupIds} });
    let objgroup = group.length > 0 ? keyBy(group, '_id') : [];
    const result =notifyIds.map(item => {
      const { _id,templateId, senderId, receiverId,isRead,count,groupId } = objNotify[item]||{};
      const { nameEn, nameVi,type } = objTemplate[templateId]||{};
      const { fullname, avatar } = objProfile[senderId]||{};
      const total =count-1;
      let groupName = '';
      if (type==='createPost') {
        //create post in group
        groupName = objgroup[groupId].nameEn||''; //sub group nameEn same nameVi
      }
      let senderEn=fullname;
      let senderVi=fullname;
      if(type==='replyFollow'||type==='reply' || type==='comment') //count by commentId
      {
        if(total>0) {
          senderVi=fullname + " và " +total+" người khác";
          if(total===1)
          {
            senderEn=fullname + " and " +total+" another";
          }else{
            senderEn=fullname + " and " +total+" others";
          }
        }
      }
      const contentEn = senderEn + ' ' + nameEn + ' ' + groupName;
      const contentVi = senderVi + ' ' + nameVi + ' ' + groupName;
      return { notifyId:_id, contentEn, contentVi, avatar, isRead };

    });
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
    const notify = await Notification.findById( { _id: notifyId, receiverId: userID });
    if (notify) {
      await Notification.updateMany({ postId: notify.postId, commentId: notify.commentId, receiverId: userID }, { $set: { isRead: true } });

      // await Notification.findOneAndUpdate(
      //   { _id: notifyId, receiverId: userID },
      //   { isRead: true },
      // );
      const result = await Notification.findById({ _id: notifyId, receiverId: userID });
      return {
        msg: msg.readNotify,
        statusCode: 200,
        data: result || {},
      };
    }else{
      return {
      msg: msg.notFound,
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

const readAllNotify = async (userID, req, lang) => {
  const msg = getMsg(lang);
  try {
    await Notification.updateMany({ receiverId: userID }, { $set: { isRead: true } });
    return {
      msg: msg.readNotify,
      statusCode: 200,
      data: {},
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getNotify = async (notifyId, lang) => {
  const msg = getMsg(lang);
  try {
  
    const notify =await Notification.findById({_id:notifyId});
    if(notify)
    {
    const template = await notifyTemplate.findById({ _id:notify.templateId});
    const profile = await Profile.findById({ _id: notify.senderId });
    const group = await Group.findById({ _id: notify.groupId });
    const groupName = group.nameEn||"";
    const avatar =profile.avatar;
    const contentEn = profile.fullname + ' ' + template.nameEn + ' ' + groupName;
    const contentVi = profile.fullname + ' ' + template.nameVi + ' ' + groupName;
    const result ={ notifyId, contentEn, contentVi, avatar };
    return {
      msg: msg.getNotify,
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


module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  createNotify,
  getNotifyByUserId,
  readNotify,
  readAllNotify,
  getNotify
};

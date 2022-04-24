const cron = require('node-cron');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Reply = require('../models/reply.model');
const Paticipant = require('../models/participant.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Notification =require('../models/notification.model');
const moment = require('moment');
const { map, keyBy } = require('lodash');
const reply = require('../models/reply.model');

//delete Account
/**
 * 1.Delete account
 * 2.Delete profile
 * 3.Delete in group (sub/main)
 * 4.delete post
 * 5. delete comment
 * 6.delete reply
 * 7.delete msg->conversation->participant 
 * 8.delete notify
 */

cron.schedule('*/1 * * * * *', async () => {

  //delete account overs 3 month
  let expirationDate = moment().subtract(3, 'months');
  const account = await Account.find({ isDelete: true, deletedDate: { $lte: expirationDate.toDate() } });
  if (account.length > 0) {
    const accountIds = map(account, '_id');
    await userSubGroup.deleteMany({ userId: { $in: accountIds } });
    await userMainGroup.deleteMany({ userId: { $in: accountIds } });
    await Post.deleteMany({ author: { $in: accountIds } });
    const comment= await Comment.find({userId: { $in: accountIds }});
    if(comment.length>0)
    {
      const commentIds= map(comment,'_id');
      await Reply.deleteMany({ commentId: { $in: commentIds } });
      await Comment.deleteMany({ userId: { $in: commentIds } });

    }

    //msg-conver-participant for 1-1
    const participant = await Paticipant.find({ participantId: { $in: accountIds } });
    if (participant.length > 0) {
      const converIds = map(participant, conversationId);
      await Message.deleteMany({ conversationId: { $in: converIds } });
      await Paticipant.deleteMany({ conversationId: { $in: converIds } });
      await Conversation.deleteMany({ _id: { $in: converIds } });
    }

    await Notification.deleteMany({$or:[{receiverId:{$in:accountIds}},{senderId:{$in:accountIds}}]});

    await Profile.deleteMany({ _id: { $in: accountIds } });
    await Account.deleteMany({ _id: { $in: accountIds } });
  }

  //delete notify over 7 days
  let expirationNotifyDate = moment().subtract(7, 'days');
  const notify = await Notification.find({ createdDate: { $lte: expirationNotifyDate.toDate() } });
  if(notify.length>0)
  {
    const notifyIds = map(notify,'_id');
    await Notification.deleteMany({_id:{$in:notifyIds}});
  }
});
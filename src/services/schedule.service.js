const cron = require('node-cron');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Reply = require('../models/reply.model');
const Paticipant= require('../models/participant.model');
const Conversation= require('../models/conversation.model');
const Message= require('../models/message.model');

/**
 * 1.Delete account
 * 2.Delete profile
 * 3.Delete in group (sub/main)
 * 4.delete post
 * 5. delete comment
 * 6.delete reply
 * 7.delete msg->conversation->participant 
 */
cron.schedule('*/1 * * * * *', async() => {
  const day = new Date();
  const now = new Date();
  let getDay =day.setDate(now.getDate() - 90);
  console.log("🚀 ~ file: schedule.service.js ~ line 27 ~ cron.schedule ~ getDay", getDay)
  // let now = dateFormat(
  //   (new Date()).setDate(day.getDate() -90),
  //   'dd/mm/yyyy',
  // );
    // let now = (Date.now).split('/');
    // console.log("🚀 ~ file: schedule.service.js ~ line 25 ~ cron.schedule ~ now", now)
    // now = new Date(now[2], now[1] - 3, now[0]);
    const account = await Account.find({isDelete:true, deletedDate:{$lte:new Date()}})
  });
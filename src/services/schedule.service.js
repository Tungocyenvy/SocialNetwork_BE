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
cron.schedule('* * 0/1  * * *', () => {
    const time = new Date().getDate - 90;
    const account = await Account.find({isDelete:true, deletedDate:{$lte:new Date()}})
  });
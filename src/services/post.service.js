const Post = require('../models/post.model');
const groupService = require('./group.service');
const NotifyMainGroup = require('../models/notify_maingroup.model');
const Profile = require('../models/profile.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const notificationService = require('./notification.service');
const NotifySend = require('../models/notify_send.model');
const notifyQueue = require('../models/notify_queue.model');
const Comment = require('../models/comment.model');
const Reply = require('../models/reply.model');
const { map, keyBy, groupBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('post'));
};

const getPostId = (groupId, lastestPost) => {
  let Id = Number(lastestPost.match(/[0-9]+$/)[0]) + 1;
  Id = groupId + Id;
  return Id;
};

//create post and send notify
const createPost = async (userID, body, lang) => {
  let { groupId, isMainGroup, isStudent } = body || {};
  const msg = getMsg(lang);
  try {
    if (!groupId && !isMainGroup) {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }
    const group = await Group.find({ _id: groupId, isMain: isMainGroup });

    if (group.length <= 0) {
      return {
        msg: msg.notFoundGroup,
        statusCode: 300,
      };
    }
    //create id increment
    const post = await Post.find({
      _id: { $regex: groupId, $options: 'is' },
    });
    let id = groupId + 1;
    if (post.length > 0) {
      const lastedPostId = post[post.length - 1]._id;
      id = getPostId(groupId, lastedPostId);
    }

    //save db
    const newPost = new Post({
      _id: id,
      title: body.title,
      content: body.content,
      author: userID,
      groupId,
      isMainGroup: body.isMainGroup,
    });

    const res = await newPost.save();
    //send notify to listUser
    if (res) {
      let sendNotify = 200;
      if (isMainGroup) {
        const lstUser = await userMainGroup.find({
          groupId: groupId,
          isStudent: isStudent,
        });

        const lstNotify = lstUser
          .filter((item) => item != null)
          .map((item) => {
            return {
              userId: item.userId,
              postId: id,
              groupId,
            };
          });

        sendNotify = (await groupService.sendNotifyForMainGroup(lstNotify))
          .statusCode;
      } else {
        let data = {};
        data.postId = newPost._id;
        data.representId = newPost._id;
        data.type = 'createPost';
        data.senderId = userID;
        data.receiverId = groupId;

        sendNotify = (await notificationService.createNotify(data)).statusCode;
      }
      if (sendNotify != 200) {
        return {
          msg: msg.errSendNotify,
          statusCode: 300,
        };
      }
      return {
        msg: msg.createPost,
        statusCode: 200,
        data: res,
      };
    } else {
      return {
        msg: msg.createPostFail,
        statusCode: 300,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//get post by userId for main group
const getListPostByUserId = async (userId, req, lang) => {
  let { groupId } = req.params || {};
  let perPage = 10;
  let { isStudent = true, page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    let lstNotify = [];
    const account = await Account.findById({ _id: userId });
    if (account) {
      if (account.roleId === 1 || account.roleId === 2) {
        if (groupId === 'grgv') isStudent = false;
        const represent = await userMainGroup.findOne({
          groupId: groupId,
          isStudent: isStudent,
        });
        if (represent) {
          lstNotify = await NotifyMainGroup.find({
            userId: represent.userId,
            groupId: groupId,
          });
        }
      } else {
        lstNotify = await NotifyMainGroup.find({
          userId: userId,
          groupId: groupId,
        });
      }
      if (lstNotify.length > 0) {
        //get top 10 post
        const postIds = map(lstNotify, 'postId');

        let result = [];
        const total = await Post.countDocuments({ _id: { $in: postIds } });
        if (total > 0) {
          const listPost = await Post.find({ _id: { $in: postIds } })
            .sort({
              createdDate: -1,
            })
            .skip(perPage * page - perPage)
            .limit(perPage);

          //get profile author [fullname, avatar]
          const userIds = map(listPost, 'author');
          const profile = await Profile.find({
            _id: {
              $in: userIds,
            },
          });

          const objProfile = keyBy(profile, '_id');

          result = listPost
            .filter((item) => item != null)
            .map((item) => {
              const { _id, author, title, content, createdDate } = item;
              const { fullname, avatar } = objProfile[author];
              return {
                _id,
                title,
                content,
                createdDate,
                author,
                fullname,
                avatar,
              };
            });
        }

        return {
          msg: msg.getListPost,
          statusCode: 200,
          data: { result, total },
        };
      } else {
        return {
          msg: msg.notHavePost,
          statusCode: 200,
          data:{result:[],total:0}
        };
      }
    } else {
      return {
        msg: msg.notFoundUser,
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

//get post by userId for sub group
const getListPostByGroupId = async (req, lang) => {
  let { groupId } = req.params || {};
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    //get top 10 list post

    const total = await Post.countDocuments({ groupId: groupId });
    let result = [];
    if (total > 0) {
      const listPost = await Post.find({ groupId: groupId })
        .sort({
          createdDate: -1,
        })
        .skip(perPage * page - perPage)
        .limit(perPage);
      if (listPost.length > 0) {
        //get profile author [fullname, avatar]
        const userIds = map(listPost, 'author');
        const profile = await Profile.find({
          _id: {
            $in: userIds,
          },
        });

        const objProfile = keyBy(profile, '_id');
        const postIds = map(listPost, '_id');
        const comment = await Comment.find({ postId: { $in: postIds } });
        let objComment={};
        if(comment.length>0) 
       {
          objComment = groupBy(comment, 'postId');
       }

        result = listPost
          .filter((item) => item != null)
          .map((item) => {
            const { _id, author, title, content, createdDate } = item;
            const { fullname, avatar } = objProfile[author];
            const countCmt=objComment[_id]? objComment[_id].length:0;
            return {
              _id,
              title,
              content,
              createdDate,
              author,
              fullname,
              avatar,
              countCmt,
            };
          });
      }

      return {
        msg: msg.getListPost,
        statusCode: 200,
        data: { result, total },
      };
    } else {
      return {
        msg: msg.notHavePost,
        statusCode: 200,
        data:{result:[],total:0}
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//get detail post by post id
const getDetailPost = async (postId, lang) => {
  const msg = getMsg(lang);
  try {
    if (!postId) postId = '';
    const result = await Post.findById({ _id: postId });
    if (result) {
      const countCmt = await Comment.countDocuments({postId:postId});
      return {
        msg: msg.getDetail,
        data: {...result._doc,countCmt},
        statusCode: 200,
      };
    } else {
      return {
        msg: msg.notFoundPost,
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

const deletePost = async (req, lang) => {
  let { postId = '' } = req.params || {};
  const msg = getMsg(lang);
  try {
    const res = await Post.findByIdAndDelete({ _id: postId });
    if (res) {
      const comment = await Comment.find({postId:postId});
      if(comment.length>0)
      {
        const commentIds = map(comment,'_id');
        await Reply.deleteMany({commentId:{$in:commentIds}});
        await Comment.deleteMany({ postId: postId });
      }
      const notify = await NotifySend.find({ postId: postId });
      if (notify.length > 0) {
        const notifyIds = map(notify, '_id');
        await NotifySend.deleteMany({ postId: postId });
        await notifyQueue.deleteMany({ notifyId: { $in: notifyIds } });
      }
      //pending delete notify
      return {
        msg: msg.deletePost,
        statusCode: 200,
      };
    } else {
      return {
        msg: msg.notFoundPost,
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

const updatePost = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const res = await Post.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await Post.findById({ _id: body._id });
      return {
        msg: msg.updatePost,
        statusCode: 200,
        data: result,
      };
    } else {
      return {
        msg: msg.notFoundPost,
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

module.exports = {
  createPost,
  getDetailPost,
  getListPostByUserId,
  getListPostByGroupId,
  deletePost,
  updatePost,
};

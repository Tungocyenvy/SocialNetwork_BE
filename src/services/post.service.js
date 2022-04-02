const Post = require('../models/post.model');
const groupService = require('./group.service');
const NotifyMainGroup = require('../models/notify_maingroup.model');
const Profile = require('../models/profile.model');
const userMainGroup = require('../models/user_maingroup.model');
const userSubGroup = require('../models/user_subgroup.model');
const Group = require('../models/group.model');
const Account = require('../models/account.model');
const { map, keyBy } = require('lodash');

const getPostId = (groupId, lastestPost) => {
  let Id = Number(lastestPost.match(/[0-9]+$/)[0]) + 1;
  Id = groupId + Id;
  return Id;
};

//create post and send notify
const createPost = async (userID, body) => {
  let { groupId, isMainGroup, isStudent } = body || {};
  try {
    if (!groupId && !isMainGroup) {
      return {
        msg: "Don't have groupId or isMainGroup",
        statusCode: 300,
      };
    }
    const group = await Group.find({ _id: groupId, isMain: isMainGroup });

    if (group.length <= 0) {
      return {
        msg: 'GroupId not found!',
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

        const sendNotify = (
          await groupService.sendNotifyForMainGroup(lstNotify)
        ).statusCode;

        if (sendNotify != 200) {
          return {
            msg: 'send notify falied!',
            statusCode: 300,
          };
        }
      } else {
        //gửi thông báo cho subgroup tạm thời xử lý sau
      }

      return {
        msg: 'Create post and send notify to group successful!',
        statusCode: 200,
        data: res,
      };
    } else {
      return {
        msg: 'create post failed!',
        statusCode: 300,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      msg: 'An error occurred during the create post process',
      statusCode: 300,
    };
  }
};

//get post by userId for main group
const getListPostByUserId = async (userId, req) => {
  let { groupId } = req.params || {};
  let perPage = 10;
  let { isStudent = true, page = 1 } = req.query || {};
  try {
    let lstNotify = [];
    const account = await Account.findById({ _id: userId });
    if (account) {
      if (account.role === 'admin' || account.role === 'dean') {
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
              const { _id, author, title, createdDate } = item;
              const { fullname, avatar } = objProfile[author];
              return {
                _id,
                title,
                createdDate,
                author,
                fullname,
                avatar,
              };
            });
        }

        return {
          msg: 'Get list post successful!',
          statusCode: 200,
          data: { result, total },
        };
      } else {
        return {
          msg: 'Not found post for group ' + groupId,
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: 'user not found!',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the get list post process',
      statusCode: 300,
    };
  }
};

//get post by userId for sub group
const getListPostByGroupId = async (req) => {
  let { groupId } = req.params || {};
  let perPage = 10;
  let { page } = req.query || 1;
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

        result = listPost
          .filter((item) => item != null)
          .map((item) => {
            const { _id, author, title, createdDate } = item;
            const { fullname, avatar } = objProfile[author];
            return {
              _id,
              title,
              createdDate,
              author,
              fullname,
              avatar,
            };
          });
      }

      return {
        msg: 'Get list post successful!',
        statusCode: 200,
        data: { result, total },
      };
    } else {
      return {
        msg: 'Not found post for group ' + groupId,
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the get list post process',
      statusCode: 300,
    };
  }
};

//get detail post by post id
const getDetailPost = async (postId) => {
  try {
    if (!postId) postId = '';
    const res = await Post.findById({ _id: postId });
    if (res) {
      return {
        msg: 'Get detail post ' + postId + ' successful!',
        data: res,
        statusCode: 200,
      };
    } else {
      return {
        msg: 'Post ' + postId + ' not found',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the get detail post process',
      statusCode: 300,
    };
  }
};

const deletePost = async (req) => {
  let { postId = '' } = req.params || {};
  try {
    const res = await Post.findByIdAndDelete({ _id: postId });
    if (res) {
      //pending delete notify
      return {
        msg: 'Delete ' + postId + ' successful!',
        statusCode: 200,
      };
    } else {
      return {
        msg: postId + ' not found!',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the delete post process',
      statusCode: 300,
    };
  }
};

const updatePost = async (body) => {
  try {
    const res = await Post.findByIdAndUpdate({ _id: body._id }, body);
    if (res) {
      const result = await Post.findById({ _id: body._id });
      return {
        msg: 'Update post successful!',
        statusCode: 200,
        data: result,
      };
    } else {
      return {
        msg: postId + ' not found!',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the update post process',
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
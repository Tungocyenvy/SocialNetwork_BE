const Post = require('../models/post.Model');
const MainGroup = require('../models/maingroup.Model');
const SubGroup = require('../models/subgroup.Model');
const groupService = require('./group.Service');
const NotifyMainGroup = require('../models/notify_maingroup.Model');
const Profile = require('../models/profile.Model');
const { map, keyBy } = require('lodash');

const getPostId = (groupId, lastestPost) => {
  let Id = Number(lastestPost.match(/[0-9]+$/)[0]) + 1;
  Id = groupId + Id;
  return Id;
};

//create post and send notify
const createPost = async (userID, body) => {
  try {
    let group = {};
    const groupId = body.groupId;
    if (body.isMainGroup) {
      group = await MainGroup.findById({ _id: groupId });
    } else {
      group = await SubGroup.findById({ _id: groupId });
    }

    if (!group) {
      return {
        msg: 'GroupId not found!',
        statusCode: 300,
      };
    }
    //create id increment
    const post = await Post.find({
      _id: { $regex: groupId, $options: 'is' },
    });
    console.log(post);
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
      let logs = [];
      let message = '';
      if (body.isMainGroup) {
        group.listPostId.push(id);
        await MainGroup.findByIdAndUpdate({ _id: groupId }, group);
        let lstUserId = group.listUserId[0];
        //group of faculity listUser student:0, teacher:1
        if (body.isStudent != null) {
          if (!body.isStudent) lstUserId = group.listUserId[1];
        }

        for (var i in lstUserId) {
          try {
            const userId = lstUserId[i];
            const stt = (
              await groupService.sendNotifyForMainGroup({
                userId,
                postId: id,
                groupId,
              })
            ).statusCode;
            if (stt === 300) {
              message =
                'An error occurred during send notify to user ' + lstUserId[i];
              logs.push(message);
              continue;
            }
          } catch {
            message =
              'An error occurred during send notify to user ' + lstUserId[i];
            logs.push(message);
            continue;
          }
        }
      } else {
        //gửi thông báo cho subgroup tạm thời xử lý sau
      }

      return {
        msg: 'Create post and send notify to group successful!',
        statusCode: 200,
        data: logs,
      };
    } else {
      return {
        msg: 'create post failed!',
        statusCode: 300,
        data: logs,
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
  let { groupId } = req.params;
  let perPage = 10;
  let { page } = req.query || 1;
  try {
    const lstNotify = await NotifyMainGroup.find({
      userId: userId,
      groupId: groupId,
    });
    if (lstNotify.length > 0) {
      //get top 10 post
      const postIds = map(lstNotify, 'postId');
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

      const objPost = keyBy(listPost, '_id');

      const result = postIds.map((item) => {
        const { author, title, content, createdDate } = objPost[item];
        const { fullname, avatar } = objProfile[author];
        return {
          title,
          content,
          createdDate,
          fullname,
          avatar,
        };
      });

      return {
        msg: 'Get list post successful!',
        statusCode: 200,
        data: result,
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

//get post by userId for sub group
const getListPostByGroupId = async (req) => {
  let { groupId } = req.params;
  let perPage = 10;
  let { page } = req.query || 1;
  try {
    //get top 10 list post
    const listPost = await Post.find({ groupId: groupId })
      .sort({
        createdDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);
    if (listPost.length > 0) {
      const postIds = map(listPost, '_id');

      //get profile author [fullname, avatar]
      const userIds = map(listPost, 'author');
      const profile = await Profile.find({
        _id: {
          $in: userIds,
        },
      });

      const objProfile = keyBy(profile, '_id');

      const objPost = keyBy(listPost, '_id');

      const result = postIds.map((item) => {
        const { author, title, content, createdDate } = objPost[item];
        const { fullname, avatar } = objProfile[author];
        return {
          title,
          content,
          createdDate,
          fullname,
          avatar,
        };
      });

      return {
        msg: 'Get list post successful!',
        statusCode: 200,
        data: result,
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
    const res = await Post.findById({ _id: postId });
    if (res) {
      return {
        msg: 'Get detail post successful!',
        data: res,
        statusCode: 200,
      };
    } else {
      return {
        msg: 'Post not found',
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

module.exports = {
  createPost,
  getDetailPost,
  getListPostByUserId,
  getListPostByGroupId,
};

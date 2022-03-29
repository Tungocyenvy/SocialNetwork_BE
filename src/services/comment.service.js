const Comment = require('../models/comment.model');
const Profile = require('../models/profile.model');
const Reply = require('../models/reply.model');
const Post = require('../models/post.model');
const { map, keyBy } = require('lodash');

const transferComment = (comment, profile) => {
  let reply = [];
  reply = comment.reply ? comment.reply : reply;
  const { _id, userId, content, postId, countReply, createdDate } = comment;
  const { fullname, avatar } = profile[userId];
  return {
    commentId: _id,
    userId,
    fullname,
    avatar,
    content,
    postId,
    countReply,
    reply,
    createdDate,
  };
};

const transferReply = (reply, profile) => {
  const { _id, userId, content, createdDate } = reply;
  const { fullname, avatar } = profile[userId];
  return {
    replyId: _id,
    userId,
    fullname,
    avatar,
    content,
    createdDate,
  };
};

const getId = (parentId, object, isComment) => {
  let _id = '';
  let code = isComment ? '_CMT' : '_RL';
  //get lastId
  let lastedId = object[object.length - 1]._id;
  var str = lastedId.match(/[0-9]+$/);
  //increment Id
  var str2 = Number(str ? str[0] : 0) + 1;
  if (str2 < 10) {
    _id = parentId + code + '0' + str2;
  } else {
    _id = parentId + code + str2;
  }
  return _id;
};
/**COMMENT */
//get comment by postId
const getComment = async (req) => {
  let perPage = 5;
  let { page } = req.query || 1;
  let { postId } = req.params || {};
  try {
    if (!postId) {
      return {
        msg: "Don't have postId!",
        statusCode: 300,
      };
    }
    const post = await Post.findById({ _id: postId });

    if (!post) {
      return {
        msg: 'PostId not found!',
        statusCode: 300,
      };
    }

    let countCmt = await Comment.countDocuments({ postId: postId });

    if (countCmt <= 0) {
      return {
        msg: "Don't have any comments!",
        statusCode: 200,
        data: { comment: {}, countCmt },
      };
    }
    //get top 5 comment
    let comment = await Comment.find({ postId: postId })
      .sort({
        createdDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);

    comment.reverse();

    //get reply
    let listComment = [];
    for (var i in comment) {
      let reply = [];
      let tmp = comment[i];
      if (tmp.countReply !== 0) {
        req.params.commentID = tmp._id;
        const rsReply = (await getReply(req)).data;
        if (rsReply) {
          reply = rsReply.result;
        }
      }

      let objComment = {};
      objComment._id = tmp._id;
      objComment.userId = tmp.userId;
      objComment.content = tmp.content;
      objComment.postId = tmp.postId;
      objComment.countReply = tmp.countReply;
      objComment.reply = reply;
      objComment.createdDate = tmp.createdDate;

      listComment.push(objComment);
    }

    // get comment author avatar
    const userIds = map(listComment, 'userId');
    const profile = await Profile.find({
      _id: {
        $in: userIds,
      },
    });

    objProfile = keyBy(profile, '_id');

    const result = listComment.map((item) => {
      return transferComment(item, objProfile);
    });

    return {
      msg: 'Get comment by postId successful!',
      statusCode: 200,
      data: { result, countCmt },
    };
  } catch (error) {
    return {
      msg: 'An error occurred during the get comment process!',
      statusCode: 300,
    };
  }
};

//create comment
const createComment = async (token, body) => {
  let { userId } = token;
  let { content, postId } = body || {};
  try {
    if (!postId) {
      return {
        msg: "Don't have postId!",
        statusCode: 300,
      };
    }

    const post = await Post.findById({ _id: postId });

    if (!post) {
      return {
        msg: 'PostId not found!',
        statusCode: 300,
      };
    }

    const comment = await Comment.find({
      _id: { $regex: postId, $options: 'is' },
      postId: postId,
    });
    let _id = postId + '_CMT01';
    if (comment.length > 0) {
      _id = getId(postId, comment, true);
    }

    const newComment = new Comment({
      _id,
      userId: userId,
      content,
      postId,
    });
    let resSave = await newComment.save();
    if (resSave) {
      const profile = await Profile.findById({ _id: resSave.userId });
      const objProfile = keyBy(profile, '_id');
      const result = transferComment(resSave, objProfile);

      return {
        msg: 'Your comment submission was successful!',
        statusCode: 200,
        data: result,
      };
    }
    resSave = {};
    return {
      msg: 'Comment failed to post',
      statusCode: 300,
      data: resSave,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during the submiss comment process!',
      statusCode: 300,
    };
  }
};

const updateComment = async (token, body) => {
  let { userId } = token;
  let { content, commentId } = body || {};
  try {
    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }
    comment.content = content;
    await Comment.findByIdAndUpdate({ _id: commentId }, comment);
    return {
      msg: 'Edit Comment Successful!',
      statusCode: 200,
      data: comment,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during edit comment process',
      statusCode: 300,
    };
  }
};

const deleteComment = async (userId, req) => {
  let { commentId } = req.params || {};
  try {
    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
      };
    }

    await Comment.findOneAndDelete({ _id: commentId });
    return {
      msg: 'Delete comment successful!',
      statusCode: 200,
    };

    // const account = await Account.findOne({ _id: userId });
    // if (comment.userId !== userId && !account.IsAdmin) {
    //   return {
    //     msg: 'Tài khoản không có quyền xóa bình luận này',
    //     statusCode: 300,
    //   };
    // }
  } catch (error) {
    return {
      msg: 'An error occurred during delete comment process',
      statusCode: 300,
    };
  }
};

/**REPLY */
const getReply = async (req) => {
  let perPage = 3;
  let { page } = req.query || 1;
  let { commentID } = req.params || {};
  try {
    if (!commentID) {
      return {
        msg: "Don't have commentId!",
        statusCode: 300,
      };
    }
    const comment = await Comment.findById({ _id: commentID });

    if (!comment) {
      return {
        msg: 'comment not found!',
        statusCode: 300,
      };
    }

    let countReply = await Reply.countDocuments({ commentId: commentID });

    if (countReply <= 0) {
      return {
        msg: "Don't have any replies!",
        statusCode: 200,
        data: { reply: {}, countReply },
      };
    }
    //get top 3 reply
    let reply = await Reply.find({ commentId: commentID })
      .sort({
        createdDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);

    reply.reverse();

    const replyId = map(reply, '_id');

    const userIds = map(reply, 'userId');
    const profile = await Profile.find({
      _id: {
        $in: userIds,
      },
    });

    objProfile = keyBy(profile, '_id');

    const result = reply.map((item) => {
      return transferReply(item, objProfile);
    });

    return {
      msg: 'Get reply by commentId successful!',
      statusCode: 200,
      data: { result, countReply },
    };
  } catch (error) {
    return {
      msg: 'An error occurred during the get reply comment process!',
      statusCode: 300,
    };
  }
};

//reply comment
const replyComment = async (token, body) => {
  let { userId } = token;
  let { content, commentId } = body || {};
  try {
    if (!commentId) {
      return {
        msg: "Don't have commentId!",
        statusCode: 300,
      };
    }

    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }

    const replys = await Reply.find({ commentId: commentId });
    let replyId = commentId + '_RL01';
    if (replys.length > 0) {
      replyId = getId(commentId, replys, false);
    }
    const objReply = new Reply({
      _id: replyId,
      userId,
      content,
      commentId,
    });

    const res = await objReply.save();
    if (res) {
      comment.countReply += 1;
      await Comment.findByIdAndUpdate({ _id: commentId }, comment);

      const profile = await Profile.findById({ _id: userId });
      const objProfile = keyBy(profile, '_id');
      const result = transferReply(res, objProfile);

      return {
        msg: 'Your reply comment submission was successful!',
        statusCode: 200,
        data: result,
      };
    }
    res = {};
    return {
      msg: 'Reply comment failed to post',
      statusCode: 300,
      data: res,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during the reply to comment process!',
      statusCode: 300,
    };
  }
};

const updateReply = async (token, body) => {
  let { userId } = token;
  let { content, replyId } = body || {};
  //console.log(_id);
  try {
    const reply = await Reply.findById({ _id: replyId });
    if (!reply) {
      return {
        msg: 'reply not found!',
        statusCode: 300,
        data: reply,
      };
    }
    reply.content = content;
    await Reply.findByIdAndUpdate({ _id: replyId }, reply);
    return {
      msg: 'Edit Reply Successful!',
      statusCode: 200,
      data: reply,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during edit reply process',
      statusCode: 300,
    };
  }
};

const deleteReply = async (userId, req) => {
  let { replyId } = req.params || {};
  try {
    const reply = await Reply.findById({ _id: replyId });
    if (!reply) {
      return {
        msg: 'reply not found!',
        statusCode: 300,
      };
    }

    await Reply.findOneAndDelete({ _id: replyId });
    return {
      msg: 'Delete reply successful!',
      statusCode: 200,
    };
    // if (replys[i].userId !== userId && !account.IsAdmin) {
    //   return {
    //     msg: 'Tài khoản không có quyền xóa bình luận này',
    //     statusCode: 300,
    //   };
    // }
  } catch (error) {
    return {
      msg: 'An error occurred during delete reply process',
      statusCode: 300,
    };
  }
};

module.exports = {
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getReply,
  replyComment,
  updateReply,
  deleteReply,
};

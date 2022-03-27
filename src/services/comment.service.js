const Comment = require('../models/comment.model');
const Profile = require('../models/profile.model');
const Reply = require('../models/reply.model');
const Post = require('../models/post.model');
const { map, keyBy } = require('lodash');

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
      objComment.commentId = tmp._id;
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
      const {
        commentId,
        userId,
        content,
        postId,
        countReply,
        reply,
        createdDate,
      } = item;
      const { fullname, avatar } = objProfile[userId];
      return {
        commentId,
        userId,
        fullname,
        avatar,
        content,
        postId,
        countReply,
        reply,
        createdDate,
      };
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
    var _id = postId + '_CMT01';
    if (comment.length > 0) {
      //get lastId
      let lastedCmtId = comment[comment.length - 1]._id;
      var str = lastedCmtId.match(/[0-9]+$/);
      //increment Id
      var str2 = Number(str ? str[0] : 0) + 1;
      if (str2 < 10) {
        _id = postId + '_CMT0' + str2;
      } else {
        _id = postId + '_CMT' + str2;
      }
    }

    const newComment = new Comment({
      _id,
      userId: userId,
      content,
      postId,
    });
    const resSave = await newComment.save();
    if (resSave) {
      return {
        msg: 'Your comment submission was successful!',
        statusCode: 200,
        data: resSave,
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
      const { _id, userId, content, createdDate } = item;
      const { fullname, avatar } = objProfile[userId];
      return {
        replyId: _id,
        userId,
        fullname,
        avatar,
        content,
        createdDate,
      };
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
    var replyId = commentId + '_RL01';
    if (replys.length > 0) {
      //get lastId
      var temp = replys[replys.length - 1]._id;
      var str = temp.match(/[0-9]+$/);
      //increment Id
      var str2 = Number(str ? str[0] : 0) + 1;
      if (str2 < 10) {
        replyId = commentId + '_RL0' + str2;
      } else {
        replyId = commentId + '_RL' + str2;
      }
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
      return {
        msg: 'Your reply comment submission was successful!',
        statusCode: 200,
        data: res,
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

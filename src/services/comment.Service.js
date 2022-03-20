const Comment = require('../models/comment.Model');
const Account = require('../models/account.Model');
const Profile = require('../models/profile.Model');

//get comment by postId
const getComment = async (body) => {
  let { postId } = body;
  console.log(postId);
  try {
    let comment = await Comment.find({ postId: postId });
    let countCmt = comment.length;
    if (countCmt === 0) {
      comment = {};
      return {
        msg: "Don't have any comments!",
        statusCode: 300,
        data: { comment, countCmt },
      };
    }
    // count total cmt and reply
    for (var i = 0; i < comment.length; i++) {
      const replys = comment[i].reply;
      countCmt += replys.length;
    }
    console.log(countCmt);
    // get comment author avatar
    for (var i in comment) {
      const data = comment[i];
      const userId = data.userId;
      const profile = await Profile.findOne({ _id: userId });

      //get avatar reply and return
      var replys = data.reply;
      let result = [];
      for (var k in replys) {
        const reply = replys[k];
        const userReply = reply.userId;
        const profileReply = await Profile.findOne({ _id: userReply });

        let objReply = {};
        objReply._id = reply._id;
        objReply.avatar = profileReply.avatar;
        objReply.fullname = profileReply.fullname;
        objReply.identifier = userReply;
        objReply.content = reply.content;
        objReply.createdDate = reply.createdDate;

        result.push(objReply);
      }
      //return obj cmt
      let dataCmt = {};
      dataCmt._id = data._id;
      dataCmt.avatar = profile.avatar;
      dataCmt.fullname = profile.fullname;
      dataCmt.identifier = userId;
      dataCmt.content = data.content;
      dataCmt.createdDate = data.createdDate;
      dataCmt.reply = result;

      comment[i] = dataCmt;
    }

    return {
      msg: 'Get comment by postId successful!',
      statusCode: 200,
      data: { comment, countCmt },
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
  let { content, postId } = body;
  try {
    const rsCmt = (await getComment({ postId: postId })).data;
    console.log(rsCmt);
    const countCmt = rsCmt.countCmt;
    const dataCmt = rsCmt.comment;
    //don't have any comment _id begin 1
    var _id = postId + '_CMT01';
    if (countCmt != 0) {
      //get lastId
      var temp = dataCmt[dataCmt.length - 1]._id;
      var str = temp.match(/[0-9]+$/);
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
      createdDate: Date.now(),
    });
    const resSave = await newComment.save();
    console.log(resSave);
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

//reply comment
const replyComment = async (token, body) => {
  let { userId } = token;
  console.log(userId);
  let { content, _id } = body;
  try {
    const comment = await Comment.findById({ _id });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }
    var replys = comment.reply;

    var replyId = 'RL01';
    if (replys.length > 0) {
      //get lastId
      var temp = replys[replys.length - 1]._id;
      var str = temp.match(/[0-9]+$/);
      //increment Id
      var str2 = Number(str ? str[0] : 0) + 1;
      if (str2 < 10) {
        replyId = 'RL0' + str2;
      } else {
        replyId = 'RL' + str2;
      }
    }

    var objReply = {};
    objReply._id = replyId;
    objReply.userId = userId;
    objReply.content = content;
    objReply.createdDate = Date.now();
    replys.push(objReply);
    comment.reply = replys;
    console.log(comment);
    await Comment.findByIdAndUpdate({ _id }, comment);
    return {
      msg: 'Reply to comment successfully',
      statusCode: 200,
      data: comment,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during the reply to comment process!',
      statusCode: 300,
    };
  }
};

const updateComment = async (token, body) => {
  let { userId } = token;
  console.log(userId);
  let { content, _id } = body;
  try {
    const comment = await Comment.findById({ _id });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }

    // if (comment.userId !== userId) {
    //   return {
    //     msg: 'Không được chỉnh sửa bình luận của người khác',
    //     statusCode: 300,
    //   };
    // }

    comment.content = content;
    comment.createdDate = Date.now();
    await Comment.findByIdAndUpdate({ _id }, comment);
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

const updateReply = async (token, body) => {
  let { userId } = token;
  let { content, _id, idComment } = body;
  //console.log(_id);
  try {
    const comment = await Comment.findById({ _id: idComment });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }
    var replys = comment.reply;

    var temp = replys.find((x) => x._id === _id);
    if (temp) {
      temp.content = content;
      temp.createdDate = Date.now();

      replys = replys.map((x) => (x._id === _id ? temp : x));

      // for (var i in replys) {
      //   if (replys[i]._id === _id) {
      //     // if (replys[i].userId !== userId) {
      //     //   return {
      //     //     msg: 'Không được chỉnh sửa bình luận của người khác',
      //     //     statusCode: 300,
      //     //   };
      //     // }
      //     replys[i].content = content;
      //     replys[i].createdDate = Date.now();
      //   }
      // }
      console.log(replys);
      comment.reply = replys;
      await Comment.findByIdAndUpdate({ _id }, comment);
      return {
        msg: 'Edit reply successful!',
        statusCode: 200,
        data: comment,
      };
    } else {
      return {
        msg: 'Reply not found!',
        statusCode: 300,
        data: temp,
      };
    }
  } catch (error) {
    return {
      msg: 'An error occurred during edit reply process',
      statusCode: 300,
    };
  }
};

const deleteComment = async (token, idComment) => {
  let { userId } = token;
  let id = idComment;
  try {
    const comment = await Comment.findById({ _id: id });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }
    // const account = await Account.findOne({ _id: userId });
    // if (comment.userId !== userId && !account.IsAdmin) {
    //   return {
    //     msg: 'Tài khoản không có quyền xóa bình luận này',
    //     statusCode: 300,
    //   };
    // }
    await Comment.findOneAndDelete({ _id: id });
    return {
      msg: 'Delete comment successful!',
      statusCode: 200,
    };
  } catch (error) {
    return {
      msg: 'An error occurred during delete comment process',
      statusCode: 300,
    };
  }
};

const deleteReply = async (token, idCmt, idRl) => {
  let { userId } = token;
  let idComment = idCmt;
  let idReply = idRl;
  try {
    const comment = await Comment.findById({ _id: idComment });
    console.log(comment);
    // const account = await Account.findOne({ _id: userId });
    if (!comment) {
      return {
        msg: 'Comment not found!',
        statusCode: 300,
        data: comment,
      };
    }
    const replys = comment.reply;
    console.log(replys);
    for (var i = 0; i < replys.length; i++) {
      if (replys[i]._id === idReply) {
        // if (replys[i].userId !== userId && !account.IsAdmin) {
        //   return {
        //     msg: 'Tài khoản không có quyền xóa bình luận này',
        //     statusCode: 300,
        //   };
        // }
        replys.splice(i, 1);
        comment.reply = replys;
        await Comment.findByIdAndUpdate({ _id: idComment }, comment);
        return {
          msg: 'Delete reply successful',
          statusCode: 200,
          data: comment,
        };
      }
    }
    return {
      msg: 'Reply not found!',
      statusCode: 300,
    };
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
  replyComment,
  updateComment,
  updateReply,
  deleteComment,
  deleteReply,
};

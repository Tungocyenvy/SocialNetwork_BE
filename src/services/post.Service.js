const Post = require('../models/post.Model');
const MainGroup = require('../models/maingroup.Model');
const SubGroup = require('../models/subgroup.Model');

const getPostId = (groupId, lastestPost) => {
  let Id = Number(lastestPost.match(/[0-9]+$/)[0]) + 1;
  Id = groupId + Id;
  return Id;
};

//Tạo bài viết
const createPost = async (userID, body) => {
  try {
    let lstGroup = {};
    if (body.isMainGroup) {
      lstGroup = await MainGroup.findById({ _id: body.groupId });
    } else {
      lstGroup = await SubGroup.findById({ _id: body.groupId });
    }

    if (lstGroup.length <= 0) {
      return {
        msg: 'GroupId not found!',
        statusCode: 300,
      };
    }
    //create id increment
    const post = await Post.find({
      _id: { $regex: body.groupId, $options: 'is' },
    });
    console.log(post);
    let id = body.groupId + 1;
    if (post.length > 0) {
      const lastedPostId = post[post.length - 1]._id;
      id = getPostId(body.groupId, lastedPostId);
    }
    console.log(id);
    return {
      msg: 'Thêm bài viết mới thành công!',
      statusCode: 200,
    };
    //     const res = await Post.create(body);
    //     if(res)
    //   console.log(lstGroup);
    //   if (lstGroup.length <= 0) {
    //     return {
    //       msg: 'GroupId không tồn tại!',
    //       statusCode: 300,
    //     };
    //   } else {
    //     const lstPost = await Post.find({});
    //     const _id = lstPost[0]._id;
    //     let group = lstPost[0].Group;

    //     let data = group.find((x) => x.Id === GroupId);
    //     console.log(data);

    //     let tmp, id;
    //     //Nếu group này chưa có bài viết thì thêm mới
    //     if (!data) {
    //       id = GroupId + 1;
    //       tmp = {
    //         Id: id,
    //         Title,
    //         Image,
    //         Overview,
    //         Content,
    //         AccountId,
    //         CategoryId,
    //       };
    //       let post = { Id: GroupId, Post: tmp };
    //       group.push(post);
    //     }
    //     //Group đã có bài viết rồi
    //     else {
    //       //Tạo id cho bài viết
    //       let lstPost = data.Post[data.Post.length - 1].Id;
    //       console.log(lstPost);
    //       id = getPostId(GroupId, lstPost);
    //       console.log(id);
    //       tmp = {
    //         Id: id,
    //         Title,
    //         Image,
    //         Overview,
    //         Content,
    //         AccountId,
    //         CategoryId,
    //       };
    //       data.Post.push(tmp);
    //       group = group.map((x) => (x.id === GroupId ? data : x));
    //     }
    //     await Post.findOneAndUpdate({ _id }, { Group: group });
    //     const resave = (await getPostbyStatus(AccountId, 'false')).data;
    //     console.log(resave);
    //     if (resave) {
    //       return {
    //         msg: 'Thêm bài viết mới thành công!',
    //         statusCode: 200,
    //         data: resave,
    //       };
    //     }
    //   }
  } catch (err) {
    console.log(err);
    return {
      msg: 'Lỗi trong quá trình thêm bài viết',
      statusCode: 300,
    };
  }
};

module.exports = {
  createPost,
};

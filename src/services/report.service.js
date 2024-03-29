const ReportGroup = require('../models/report_group.model');
const ReportPost = require('../models/report_port.model');
const Category = require('../models/category.model');
const Group = require('../models/group.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const { groupBy, map, keyBy, sum } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('report'));
};

/**CREATE */
//group
const createReportGroup = async (body, lang) => {
  const msg = getMsg(lang);
  let { groupId, reportId } = body || {};
  try {
    const group = await Group.findById({_id:groupId,isMain:false})
    if(!group)
    {
      return {
        msg: msg.notFoundGroup,
        statusCode: 300,
      };
    }
    const report = await ReportGroup.findOne({
      groupId: groupId,
      reportId: reportId,
    });
    if (report) {
      report.count += 1;
      await report.save();
    }
    else{
      const res = await ReportGroup.create(body);
    }
    group.countReport +=1;
    await group.save();
    return {
      msg: msg.createReport,
      statusCode: 200,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//post
const createReportPost = async (body, lang) => {
  const msg = getMsg(lang);
  let { postId, reportId } = body || {};
  try {
    const post = await Post.findById({_id:postId,isMainGroup:false})
    if(!post)
    {
      return {
        msg: msg.notFoundPost,
        statusCode: 300,
      };
    }

    const report = await ReportPost.findOne({
      postId: postId,
      reportId: reportId,
    });
    if (report) {
      report.count += 1;
      await report.save();
    }
    else{
      const res = await ReportPost.create(body);
    }

    post.countReport+=1;
    await post.save();
      return {
        msg: msg.createReport,
        statusCode: 200,
      };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

/**GET FOR MANAGER */
//REPORT FOR GROUP
const getReportGroup = async (groupId, lang) => {
  const msg = getMsg(lang);
  try {
    const reportCate = await Category.find({type:3});
    const reportIds = map(reportCate, '_id');
    const objReportCate = keyBy(reportCate, '_id');
    const listReport = await ReportGroup.find({ groupId: groupId });
    let result = [];
    if (listReport.length <= 0) {
      result = reportIds.map((item) => {
        const count = 0;
        const { _id, nameEn, nameVi } = objReportCate[item]||{};
        return { reportId: _id, nameEn, nameVi, count };
      });
    } else {
      const objReport = keyBy(listReport, 'reportId');
      result = reportIds.map((item) => {
        const count = objReport[item] ? objReport[item].count : 0;
        const { _id, nameEn, nameVi } = objReportCate[item]||{};
        return { reportId: _id, nameEn, nameVi, count };
      });
    }

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: msg.errGetReport,
      statusCode: 300,
    };
  }
};

//REPORT FOR POST
const getReportPost = async (postId, lang) => {
  const msg = getMsg(lang);
  try {
    const reportCate = await Category.find({type:3});
    const reportIds = map(reportCate, '_id');
    const objReportCate = keyBy(reportCate, '_id');
    const listReport = await ReportPost.find({ postId: postId });
    let result = [];
    if (listReport.length <= 0) {
      result = reportIds.map((item) => {
        const count = 0;
        const { _id, nameEn, nameVi } = objReportCate[item]||{};
        return { reportId: _id, nameEn, nameVi, count };
      });
    } else {
      const objReport = keyBy(listReport, 'reportId');
      result = reportIds.map((item) => {
        const count = objReport[item] ? objReport[item].count : 0;
        const { _id, nameEn, nameVi } = objReportCate[item]||{};
        return { reportId: _id, nameEn, nameVi, count };
      });
    }

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: msg.errGetReport,
      statusCode: 300,
    };
  }
};

//for admin
const getReportAllGroup = async (req, lang) => {
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    const total = await Group.countDocuments({ isMain: false });
    if (total <= 0) {
      return {
        msg: msg.notHaveGroup,
        statusCode: 200,
        data:{result:[],total}
      };
    }
    const listGroup = await Group.find({ isMain: false })
      .sort({countReport:-1})
      .skip(perPage * page - perPage)
      .limit(perPage);

    const groupIds = map(listGroup, '_id');
    const objGroup = keyBy(listGroup, '_id');
    let log = {};
    const result = await Promise.all(
      groupIds.map(async (item) => {
        //get report
        const rs = await getReportGroup(item, lang);
        if (rs.statusCode === 300) {
          log = rs;
          return;
        }
        const report = rs.data||{};
        //get post
        const { _id, nameEn, nameVi,countReport } = objGroup[item]||{};
        const countPost = await Post.countDocuments({ groupId: item });
        return {
          groupId: _id,
          nameEn,
          nameVi,
          countPost,
          countReport,
          report,
        };
      }),
    );

    if (log.statusCode === 300) return log;

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: {result,total}
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getReportAllPost = async (req, lang) => {
  let perPage = 10;
  let { groupId, page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    const total = groupId
      ? await Post.countDocuments({ isMainGroup: false, groupId: groupId })
      : await Post.countDocuments({ isMainGroup: false });
    if (total <= 0) {
      return {
        msg: msg.notHavePost,
        statusCode: 200,
        data:{result:[],total}
      };
    }
    const listPost = groupId
      ? await Post.find({ isMainGroup: false, groupId: groupId })
          .sort({countReport:-1})
          .skip(perPage * page - perPage)
          .limit(perPage)
      : await Post.find({ isMainGroup: false })
          .sort({countReport:-1})
          .skip(perPage * page - perPage)
          .limit(perPage);

    const postIds = map(listPost, '_id');
    const objPost = keyBy(listPost, '_id');

    const listComment = await Comment.find({
      postId: {
        $in: postIds,
      },
    });

    let countComment = 0;

    let objReply = {};
    if (listComment.length > 0) {
      const reply = listComment.map((x) => {
        return { postId: x.postId, countReply: x.countReply };
      });
      objReply = groupBy(reply, 'postId');
    }
    let log = {};
    const result = await Promise.all(
      postIds.map(async (item) => {
        const rs = await getReportPost(item, lang);
        if (rs.statusCode === 300) {
          log = rs;
          return;
        }
        const report = rs.data||{};
        const { _id, content,countReport } = objPost[item]||{};
        countComment = objReply[item] ? objReply[item].length : 0;
        if (countComment != 0)
          countComment += sum(map(objReply[item], 'countReply'));
        return {
          postId: _id,
          content,
          countComment,
          countReport,
          report,
        };
      }),
    );

    if (log.statusCode === 300) return log;

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: {result,total}
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  createReportGroup,
  createReportPost,
  getReportAllGroup,
  getReportAllPost,
};

const ReportGroup = require('../models/report_group.model');
const ReportPost = require('../models/report_port.model');
const ReportCategory = require('../models/category_report.model');
const { groupBy, map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('report'));
};

//REPORT FOR GROUP
const getReportGroup = async (req, lang) => {
  const msg = getMsg(lang);
  let { groupId } = req.params || {};
  try {
    const listReport = await ReportGroup.find({ groupId: groupId });
    if (listReport.length <= 0) {
      return {
        msg: msg.notHave,
        statusCode: 300,
      };
    }

    const reportIds = map(listReport, 'reportId');
    const reportCate = await ReportCategory.find({ _id: { $in: reportIds } });

    const objReport = keyBy(listReport, 'reportId');
    const objReportCate = keyBy(reportCate, '_id');
    const result = reportIds.map((item) => {
      const { reportId, count } = objReport[item];
      const { nameEn, nameVi } = objReportCate[reportId];
      return { reportId, nameEn, nameVi, count };
    });

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createReportGroup = async (body, lang) => {
  const msg = getMsg(lang);
  let { groupId, reportId } = body || {};
  try {
    const report = await ReportGroup.findOne({
      groupId: groupId,
      reportId: reportId,
    });
    if (report) {
      report.count += 1;
      await report.save();
      return {
        msg: msg.createReport,
        statusCode: 200,
      };
    }

    const res = await ReportGroup.create(body);

    if (res) {
      return {
        msg: msg.createReport,
        statusCode: 200,
      };
    } else {
      return {
        msg: msg.createReportFail,
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

//REPORT FOR POST
const getReportPost = async (req, lang) => {
  const msg = getMsg(lang);
  let { postId } = req.params || {};
  try {
    const listReport = await ReportPost.find({ postId: postId });
    if (listReport.length <= 0) {
      return {
        msg: msg.notHave,
        statusCode: 300,
      };
    }

    const reportIds = map(listReport, 'reportId');
    const reportCate = await ReportCategory.find({ _id: { $in: reportIds } });

    const objReport = keyBy(listReport, 'reportId');
    const objReportCate = keyBy(reportCate, '_id');
    const result = reportIds.map((item) => {
      const { reportId, count } = objReport[item];
      const { nameEn, nameVi } = objReportCate[reportId];
      return { reportId, nameEn, nameVi, count };
    });

    return {
      msg: msg.getReport,
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createReportPost = async (body, lang) => {
  const msg = getMsg(lang);
  let { postId, reportId } = body || {};
  try {
    const report = await ReportPost.findOne({
      postId: postId,
      reportId: reportId,
    });
    if (report) {
      report.count += 1;
      await report.save();
      return {
        msg: msg.createReport,
        statusCode: 200,
      };
    }

    const res = await ReportPost.create(body);

    if (res) {
      return {
        msg: msg.createReport,
        statusCode: 200,
      };
    } else {
      return {
        msg: msg.createReportFail,
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
  getReportGroup,
  createReportGroup,
  getReportPost,
  createReportPost,
};

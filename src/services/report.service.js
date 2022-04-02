const ReportGroup = require('../models/report_group.model');
const ReportPost = require('../models/report_port.model');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('report'));
};

//REPORT FOR GROUP
const getReportGroup = async (body, lang) => {
  const msg = getMsg(lang);
  let { groupId } = body || {};
  try {
    const listReport = await ReportGroup.find({ groupId: groupId });
    if (listReport.length <= 0) {
      return {
        msg: msg.notHave,
        statusCode: 300,
      };
    }

    const total = await CategoryGroup.countDocuments({ isDelete: isDelete });
    if (total <= 0) {
      return {
        msg: "Don't have any category",
        statusCode: 300,
      };
    }

    if (isAll) perPage = total;

    const result = await CategoryGroup.find({ isDelete: isDelete })
      .skip(perPage * page - perPage)
      .limit(perPage);
    return {
      msg: 'get category successful!',
      statusCode: 200,
      data: result,
    };
  } catch {
    return {
      msg: 'An error occurred during the get category  process',
      statusCode: 300,
    };
  }
};

module.exports = {
  getReportGroup,
};

const notifyQueue = require('../models/notify_queue.model');
const notifyTemplate = require('../models/notify_template.model');
const notifySend = require('../models/notify_send.model');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('notify'));
};

const getId = (object) => {
  let _id = '';
  //get lastId
  let lastedId = object[object.length - 1]._id;
  var str = lastedId.match(/[0-9]+$/);
  //increment Id
  var str2 = Number(str ? str[0] : 0) + 1;
  if (str2 < 10) {
    _id = 'TL0' + str2;
  } else {
    _id = 'TL' + str2;
  }
  return _id;
};

/*TEMPLATE*/
//create template
/*QUEUE*/
/*SEND*/

const createTemplate = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const checkName = await notifyTemplate.find({
        $or: [{ nameEn: body.nameEn }, { nameVi: body.nameVi }],
      });
      if (checkName.length > 0) {
        return {
          msg: msg.existsTemplate,
          statusCode: 300,
        };
      }
      let data = body;
      const template = await notifyTemplate.find({});
      data._id = 'TL01';
      if (template.length > 0) {
        data._id = getId(template);
      }
      const res = await notifyTemplate.create(data);
      if (res) {
        return {
          msg: msg.createTemplate,
          statusCode: 200,
          data: res,
        };
      }
    } else {
      return {
        msg: msg.validator,
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getTemplate = async (lang) => {
  const msg = getMsg(lang);
  try {
    const template = await notifyTemplate.find({});

    if (template.length <= 0) {
      return {
        msg: msg.notHaveTemplate,
        statusCode: 200,
        data: [],
      };
    }

    return {
      msg: msg.getTemplate,
      statusCode: 200,
      data: template,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateTemplate = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const template = await notifyTemplate.findByIdAndUpdate(
      { _id: body._id },
      body,
    );
    if (template) {
      const result = await notifyTemplate.findById({ _id: body._id });
      return {
        msg: msg.updateTemplate,
        statusCode: 200,
        data: result,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const deleteTemplate = async (req, lang) => {
  const msg = getMsg(lang);
  let { templateId } = req.query || {};
  try {
    const template = await notifyTemplate.findByIdAndDelete({
      _id: templateId,
    });

    if (template) {
      const result = await notifyTemplate.find({});
      return {
        msg: msg.deleteTemplate,
        statusCode: 200,
        data: result,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};
module.exports = {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
};

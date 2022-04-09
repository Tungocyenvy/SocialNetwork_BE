const notifyQueue = require('../models/notify_queue.model');
const notifyTemplate = require('../models/notify_template.model');
const notifySend = require('../models/notify_send.model');
const userSubGroup = require('../models/user_subgroup.model');
const Profile = require('../models/profile.model');
const Group = require('../models/group.model');
const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('notify'));
};

const getId = (code, object) => {
  let _id = '';
  //get lastId
  let lastedId = object[object.length - 1]._id;
  var str = lastedId.match(/[0-9]+$/);
  //increment Id
  var str2 = Number(str ? str[0] : 0) + 1;
  if (str2 < 10) {
    _id = code + str2;
  } else {
    _id = code + str2;
  }
  return _id;
};

/*TEMPLATE*/
//CRUD
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
        data._id = getId('TL', template);
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

const createNotifyQueue = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    const result = await notifyQueue.create(body);
    return {
      msg: msg.createQueue,
      statusCode: 200,
      data: result,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

/**1:add friend
 * 2:comment
 * 3: reply
 * 4: createPost
 */
const createNotify = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    let data = body;
    const type = body.type;
    const templateId = await notifyTemplate.findOne({ type: type });
    data.templateId = templateId;
    delete data.type;
    const result = await notifySend.create(data);
    if (result) {
      let userIds = [];
      if (type === 'createPost') {
        const listUser = await userSubGroup.find({
          groupId: body.receiverId,
          userId: { $nin: body.senderId },
        });
        if (listUser.length > 0) {
          userIds = map(listUser, 'userId');
        }
      } else {
        userIds = body.receiverId;
      }
      const queue = userIds.map((id) => {
        const userId = id;
        const notifyId = result._id;
        return { userId, notifyId };
      });

      const res = await notifyQueue.insertMany(queue);
      if (res) {
        return {
          msg: msg.createNotify,
          statusCode: 200,
          data: result,
        };
      }
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getNotify = async (userID, req, lang) => {
  let perPage = 10;
  let { page = 1 } = req.query || {};
  const msg = getMsg(lang);
  try {
    const total = await notifyQueue.countDocuments({ userId: userID });
    if (total <= 0) {
      return {
        msg: msg.notHaveNotify,
        statusCode: 200,
        data: [],
      };
    }

    const queue = await notifyQueue
      .find({ userId: userID })
      .sort({
        createdDate: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const objQueue = keyBy(queue, 'notifyId');

    const notifyIds = map(queue, 'notifyId');
    const notify = await notifySend.find({ _id: { $in: notifyIds } });
    objNotify = keyBy(notify, '_id');

    const templateIds = map(notify, 'templateId');
    const template = await notifyTemplate.find({ _id: { $in: templateIds } });
    const objTemplate = keyBy(template, '_id');

    const senderIds = map(notify, 'senderId');
    const profile = await Profile.find({ _id: { $in: senderIds } });
    const objProfile = keyBy(profile, '_id');

    const receiverIds = map(notify, 'receiverId');
    const group = await Group.find({ _id: receiverIds });
    let objgroup = group.length > 0 ? keyBy(group, '_id') : [];
    const result = notifyIds.map((item) => {
      const { notifyId, isRead } = objQueue[item];
      const { templateId, senderId, receiverId } = objNotify[item];
      const { nameEn, nameVi } = objTemplate[templateId];
      const { fullname, avatar } = objProfile[senderId];
      let groupName = '';
      if (receiverId != userID) {
        //create post in group
        groupName = objgroup[receiverId].nameEn; //sub group nameEn same nameVi
      }
      const contentEn = fullname + ' ' + nameEn + ' ' + groupName;
      const contentVi = fullname + ' ' + nameVi + ' ' + groupName;

      return { notifyId, contentEn, contentVi, avatar, isRead };
    });
    return {
      msg: msg.getNotify,
      statusCode: 200,
      data: result,
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const readNotify = async (userID, req, lang) => {
  let { notifyId } = req.query || {};
  const msg = getMsg(lang);
  try {
    const res = await notifyQueue.findOneAndUpdate(
      { notifyId: notifyId, userId: userID },
      { isRead: true },
    );
    if (res) {
      return {
        msg: msg.readNotify,
        statusCode: 200,
        data: [],
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
  createNotifyQueue,
  createNotify,
  getNotify,
  readNotify,
};

const Conversation = require('../models/conversation.model');
const Participant = require('../models/participant.model');
const Profile = require('../models/profile.model');
const participantService = require('./participant.service');

const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('conversation'));
};

const getConversationId = async (userOne, userTwo) => {
  const sub = 'admin';
  var result = '';
  if (userOne.indexOf(sub) === 0 || userTwo.indexOf(sub) === 0) {
    if (userOne.indexOf(sub) !== 0) {
      //TH userOne is User, userTwo is admin
      result = userOne + '' + userOne; //....admin
    } else if (userTwo.indexOf(sub) !== 0) {
      //TH userOne is admin, userTwo is user
      result = userTwo + '' + userOne; //....admin
    } else {
      //TH 2 admin
      if (userOne > userTwo) {
        result = userTwo + '' + userOne;
      } else {
        result = userOne + '' + userTwo;
      }
    }
  } else {
    if (Number(userOne) > Number(userTwo)) {
      result = userTwo + '' + userOne;
    } else {
      result = userOne + '' + userTwo;
    }
  }
  return result;
};
const getConversation = async (userOne, userTwo, lang) => {
  const msg = getMsg(lang);
  const result = await getConversationId(userOne, userTwo);
  if (result) {
    const conversation = await Conversation.findById(result);
    const user = await Profile.findById(userTwo);
    const { _id, lastestMessage, participantId } = conversation || {};
    const data = conversation
      ? {
          _id,
          lastestMessage,
          participantId,
          user,
        }
      : {
          _id: result,
          user,
        };

    return {
      msg: msg.getConversation,
      statusCode: 200,
      data,
    };
  } else {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const createConversation = async (body, lang) => {
  try {
    var userOne = body[0];
    var userTwo = body[1];
    const msg = getMsg(lang);

    const conversationId = await getConversationId(userOne, userTwo);
    if (conversationId) {
      const conversation = await Conversation.findById({
        _id: conversationId,
      });
      if (!conversation) {
        const res = await Conversation.create({
          _id: conversationId,
        });
        if (res) {
          const participants = body.map((participantId) => {
            return {
              conversationId: res._id,
              participantId,
            };
          });
          const addParticipant = (
            await participantService.addParticipant(participants)
          ).statusCode;
          if (addParticipant === 200) {
            return {
              msg: msg.createConversation,
              statusCode: 200,
              data: res,
            };
          } else {
            return {
              msg: msg.errParticipant,
              statusCode: 300,
              data: res,
            };
          }
        } else {
          return {
            msg: msg.errCreateConver,
            statusCode: 300,
          };
        }
      }
      return {
        data: conversation,
      };
    } else {
      return {
        msg: msg.errCreateConver,
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

const updateConversation = async (body, lang) => {
  const msg = getMsg(lang);
  try {
    if (body) {
      const conversation = new Conversation();
      conversation._id = body.conversationId;
      conversation.lastestMessage = body.data;
      conversation.updatedDate = Date.now;
      const res = await Conversation.findByIdAndUpdate(
        {
          _id: body.conversationId,
        },
        conversation,
      );
      return {
        msg: msg.updateConversation,
        statusCode: 200,
        data: res,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getListConversation = async (userId, req, lang) => {
  let perPage = 10;
  let { page } = req.query || 1;
  const msg = getMsg(lang);
  try {
    let result = [];
    let total = 0;

    const participant = await Participant.find({
      participantId: userId,
    });

    if (participant.length > 0) {
      //get conversationId
      const conversationIds = map(participant, 'conversationId');
      //get top 10 conversation by conversationId
      total = await Conversation.countDocuments({
        _id: {
          $in: conversationIds,
        },
      });

      if (total > 0) {
        const conversation = await Conversation.find({
          _id: {
            $in: conversationIds,
          },
        })
          .sort({
            updatedDate: -1,
          })
          .skip(perPage * page - perPage)
          .limit(perPage);

        //get top 10 participant of user
        let lstParticipant = await Participant.find({
          conversationId: {
            $in: conversationIds,
          },
        });
        lstParticipant = lstParticipant.filter(
          (x) => x.participantId != userId,
        );

        //get top 10 participantId
        const participantIds = map(lstParticipant, 'participantId');

        //get profile of lstParticipant
        const profile = await Profile.find({
          _id: {
            $in: participantIds,
          },
        });

        const objProfile = keyBy(profile, '_id');

        const objConversation = keyBy(conversation, '_id');

        const objParticipant = keyBy(lstParticipant, 'conversationId');

        result = conversation
          .filter((item) => item.lastestMessage !== null)
          .map((item) => {
            const { _id, lastestMessage } = objConversation[item._id]||{};
            const { participantId } = objParticipant[item._id]||{};
            const user = objProfile[participantId]||{};
            return {
              _id,
              lastestMessage,
              participantId,
              user,
            };
          });
      }
    }
    return {
      msg: msg.getListConver,
      statusCode: 200,
      data: {
        result,
        total,
      },
    };
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

module.exports = {
  createConversation,
  updateConversation,
  getListConversation,
  getConversation,
};

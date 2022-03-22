const Conversation = require('../models/conversation.Model');
const Participant = require('../models/participant.Model');
const Profile = require('../models/profile.Model');
const participantService = require('./participant.Service');
const { map, keyBy } = require('lodash');

const getConversationId = (userOne, userTwo) => {
  const sub = 'admin';
  var result = '';
  if (userOne.indexOf(sub) === 0 || userTwo.indexOf(sub) === 0) {
    if (userOne.indexOf(sub) === -1) {
      //TH userOne is User, userTwo is admin
      result = userTwo + '' + userOne; //....admin
    } else if (userTwo.indexOf(sub) === -1) {
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

const createConversation = async (body) => {
  try {
    var userOne = body[0];
    var userTwo = body[1];

    const conversationId = getConversationId(userOne, userTwo);
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
        const addParticipant = await participantService.addParticipant(
          participants,
        );
        if (addParticipant) {
          return {
            msg: 'create a conversation & add participants successfully',
            statusCode: 200,
            data: res,
          };
        } else {
          return {
            msg: 'add participants failed',
            statusCode: 300,
            data: res,
          };
        }
      } else {
        return {
          msg: 'create a converstion failed',
          statusCode: 300,
        };
      }
    }
    return {
      data: conversation,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during creating conversation',
      statusCode: 300,
    };
  }
};

const updateConversation = async (body) => {
  try {
    const conversation = new Conversation();
    conversation._id = body.conversationId;
    conversation.lastestMessage = body.data;
    conversation.updatedDate = Date.now();
    const res = await Conversation.findByIdAndUpdate(
      {
        _id: body.conversationId,
      },
      conversation,
    );
    return {
      msg: 'update a conversation successfully',
      statusCode: 200,
      data: res,
    };
  } catch (err) {
    return {
      msg: 'An error occurred during the update conversation process',
      statusCode: 300,
    };
  }
};

const getListConversation = async (userId, req) => {
  let perPage = 10;
  let { page } = req.query || 1;
  try {
    let result = [];
    let total = 0;

    const participant = await Participant.find({
      participantId: userId,
    });

    if (participant.length > 0) {
      console.log(1);
      //get conversationId
      const conversationIds = map(participant, 'conversationId');

      //get top 10 conversation by conversationId
      total = await Conversation.countDocuments({
        _id: {
          $in: conversationIds,
        },
      });
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
      lstParticipant = lstParticipant.filter((x) => x.participantId != userId);

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

      result = conversationIds.map((item) => {
        const { _id, lastestMessage } = objConversation[item];
        const { participantId } = objParticipant[item];
        const { fullname, avatar } = objProfile[participantId];
        return {
          _id,
          lastestMessage,
          participantId,
          fullname,
          avatar,
        };
      });
    }
    console.log(result);
    return {
      msg: 'get list conversation successfully',
      statusCode: 200,
      data: {
        result,
        total,
      },
    };
  } catch (err) {
    return {
      msg: 'An error occurred during the get list conversation process',
      statusCode: 300,
    };
  }
};

module.exports = {
  createConversation,
  updateConversation,
  getListConversation,
};

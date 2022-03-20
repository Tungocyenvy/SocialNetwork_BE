const Conversation = require('../models/conversation.Model');
const Participant = require('../models/participant.Model');
const Profile = require('../models/profile.Model');
const participantService = require('./participant.Service');
const { map, keyBy } = require('lodash');

const getConversationId = (userOne, userTwo) => {
  var result = '';
  if (userOne > userTwo) {
    result = userTwo + '' + userOne;
  } else {
    result = userOne + '' + userTwo;
  }
  return result;
};

const createConversation = async (body) => {
  try {
    var userOne = Number(body[0]);
    var userTwo = Number(body[1]);

    const conversationId = getConversationId(userOne, userTwo);
    const conversation = await Conversation.findById({ _id: conversationId });
    if (!conversation) {
      const res = await Conversation.create({
        _id: conversationId,
      });
      if (res) {
        const participants = body.participantIds.map((participantId) => {
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
  } catch (err) {
    return {
      msg: 'An error occurred during creating conversation',
      statusCode: 300,
    };
  }
};

const updateConversation = async (body) => {
  try {
    const res = await Conversation.findByIdAndUpdate(
      { _id: body.conversationId },
      body.data,
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
    //get top 10 lastest conversation
    const participant = await Participant.find({ participantId: userId })
      .sort({ length: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage);

    //get top 10 conversationId
    const conversationIds = map(participant, 'conversationId');

    //get top 10 conversation by conversationId
    const conversation = await Conversation.find({
      _id: { $in: conversationIds },
    });

    //get top 10 participant of user
    let lstParticipant = await Participant.find({
      conversationId: { $in: conversationIds },
    });
    lstParticipant = lstParticipant.filter((x) => x.participantId != userId);

    //get top 10 participantId
    const participantIds = map(lstParticipant, 'participantId');

    //get profile of lstParticipant
    const profile = await Profile.find({ _id: { $in: participantIds } });

    const objProfile = keyBy(profile, '_id');

    const objConversation = keyBy(conversation, '_id');

    const objParticipant = keyBy(lstParticipant, 'conversationId');

    const result = conversationIds.map((item) => {
      const { _id, lastestMessage } = objConversation[item];
      const { participantId } = objParticipant[item];
      const { fullname, avatar } = objProfile[participantId];
      return {
        _id,
        lastestMessage,
        fullname,
        avatar,
      };
    });

    console.log(result);
    return {
      msg: 'get list conversation successfully',
      statusCode: 200,
      data: result,
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

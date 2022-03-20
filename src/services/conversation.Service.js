const conversation = require('../models/conversation.Model');
const participantService = require('./participant.Service');

const createConversation = async (body) => {
  try {
    const res = await conversation.create({
      name: body.conversationName,
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
  } catch (err) {
    return {
      msg: 'An error occurred during creating conversation',
      statusCode: 300,
    };
  }
};

module.exports = {
  createConversation,
};

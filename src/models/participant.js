const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ParticipantSchema = new schema({
  conversationId: {
    type: String,
    required: true,
  },
  participantId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 1,
  },
});

const participant = mongoose.model('participant', ParticipantSchema);
module.exports = participant;

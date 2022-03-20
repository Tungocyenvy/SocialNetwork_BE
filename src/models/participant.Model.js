const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ParticipantSchema = new schema({
  conversationId: {
    type: String,
    require: true,
  },
  participantId: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    default: 1,
  },
});

const comment = mongoose.model('participant', ParticipantSchema);
module.exports = comment;

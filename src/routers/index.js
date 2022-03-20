const express = require('express');
//const router = express.Router();

const account = require('./account.Router');
const comment = require('./comment.Router');
const image = require('./image.Router');
const group = require('./group.Router');
const conversation = require('./conversation.Router');
const message = require('./message.Router');
const participant = require('./participant.Router');

function router(app) {
  app.use('/account', account);
  app.use('/comment', comment);
  app.use('/image', image);
  app.use('/group', group);
  app.use('/conversation', conversation);
  app.use('/message', message);
  app.use('/participant', participant);
}

module.exports = router;

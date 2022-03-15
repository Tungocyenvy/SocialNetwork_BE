const express = require('express');
//const router = express.Router();

const account = require('./accountRouter');
const comment = require('./commentRouter');
const image = require('./imageRouter');
const group = require('./groupRouter');
const conversation = require('./conversationRouter');
const message = require('./messageRouter');
const participant = require('./participantRouter');

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

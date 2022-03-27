const express = require('express');
//const router = express.router();

const account = require('./account.router');
const comment = require('./comment.router');
const image = require('./image.router');
const group = require('./group.router');
const conversation = require('./conversation.router');
const message = require('./message.router');
const participant = require('./participant.router');
const post = require('./post.router');

function router(app) {
  app.use('/account', account);
  app.use('/comment', comment);

  app.use('/image', image);
  app.use('/group', group);
  app.use('/conversation', conversation);
  app.use('/message', message);
  app.use('/participant', participant);
  app.use('/post', post);
}

module.exports = router;

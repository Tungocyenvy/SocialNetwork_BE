const express = require('express');
//const router = express.Router();

const account = require('./accountRouter');
const comment = require('./commentRouter');
const image = require('./imageRouter');
const group = require('./groupRouter');

function router(app) {
  app.use('/account', account);
  app.use('/comment', comment);
  app.use('/image', image);
  app.use('/group', group);
}

module.exports = router;

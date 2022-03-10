const express = require('express');
//const router = express.Router();

const account = require('./accountRouter');
const comment = require('./commentRouter');
const image = require('./imageRouter');

function router(app) {
  app.use('/account', account);
  app.use('/comment', comment);
  app.use('/image', image);
}

module.exports = router;

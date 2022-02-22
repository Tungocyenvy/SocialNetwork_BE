const express = require('express');
//const router = express.Router();

const account = require('./accountRouter');
const comment = require('./commentRouter');

function router(app) {
  app.use('/account', account);
  app.use('/comment', comment);
}

module.exports = router;

const express = require('express');
//const router = express.Router();

const account = require('./accountRouter');

function router(app) {
  app.use('/account', account);
}

module.exports = router;

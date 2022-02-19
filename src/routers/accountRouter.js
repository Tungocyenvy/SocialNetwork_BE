const express = require('express');
const router = express.Router();
const jwt = require('../services/jwtService');
const accountController = require('../controllers/accountController');

router.post('/signin', accountController.signin);

module.exports = router;

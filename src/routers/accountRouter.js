const express = require('express');
const router = express.Router();
const jwt = require('../services/jwtService');
const accountController = require('../controllers/accountController');

router.post('/signin', accountController.signin);
router.post('/forgotPass', accountController.forgotPass);

module.exports = router;

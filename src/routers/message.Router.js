const express = require('express');
const jwt = require('../services/jwt.Service');
const router = express.Router();

const messageController = require('../controllers/message.Controller');

router.get('/', jwt.verify, messageController.getMessage);

module.exports = router;

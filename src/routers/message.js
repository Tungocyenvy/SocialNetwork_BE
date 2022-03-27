const express = require('express');
const jwt = require('../services/jwt.service');
const router = express.Router();

const messageController = require('../controllers/message.controller');

router.get('/', jwt.verify, messageController.getMessage);

module.exports = router;

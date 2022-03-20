const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.Controller');

router.post('/', conversationController.createConversation);

module.exports = router;

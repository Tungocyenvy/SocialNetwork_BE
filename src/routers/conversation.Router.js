const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.Controller');
const jwt = require('../services/jwt.Service');

router.post('/', conversationController.createConversation);
router.put('/', conversationController.updateConversation);
router.get('/', jwt.verify, conversationController.getListConversation);

router.get('/id', conversationController.getConversationId);

module.exports = router;

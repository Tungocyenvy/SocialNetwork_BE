const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const jwt = require('../services/jwt.service');

router.post('/', conversationController.createConversation);
router.put('/', conversationController.updateConversation);
router.get('/', jwt.verify, conversationController.getListConversation);

router.get('/id', conversationController.getConversation);

module.exports = router;

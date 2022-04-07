const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const notificationService = require('../controllers/notification.controller');

//TEMPLATE
router.post('/template', notificationService.createTemplate);
router.get('/template', notificationService.getTemplate);
router.put('/template', notificationService.updateTemplate);
router.delete('/template', notificationService.deleteTemplate);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.Service');
const groupController = require('../controllers/group.Controller');

//User
router.post('/user', groupController.addUser);

//sendNotify for maingroup
router.post('/main/notify', groupController.sendNotifyForMainGroup);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const groupController = require('../controllers/group.controller');

//User
router.post('/user', groupController.addUser);
//delte one user
router.delete('/user', groupController.deleteUser);
router.delete('/listuser', groupController.deleteListUser);

//sendNotify for maingroup
router.post('/main/notify', groupController.sendNotifyForMainGroup);

module.exports = router;

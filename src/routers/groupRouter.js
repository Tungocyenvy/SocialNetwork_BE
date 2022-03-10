const express = require('express');
const router = express.Router();
const jwt = require('../services/jwtService');
const groupController = require('../controllers/groupController');

//User
router.post('/user', groupController.addUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('../services/jwtService');
const accountController = require('../controllers/accountController');

router.post('/signin', accountController.signin);
router.post('/forgotPass', accountController.forgotPass);
router.post('/changePass', jwt.verify, accountController.changePassword);

//profile
router.get('/profile', jwt.verify, accountController.getProfile);
router.put('/profile', jwt.verify, accountController.updateProfile);

module.exports = router;

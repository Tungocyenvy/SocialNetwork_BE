const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.Service');
const accountController = require('../controllers/account.Controller');

//ACCOUNT
router.post('/signin', accountController.signin);
router.post('/forgotPass', accountController.forgotPass);
router.post('/changePass', jwt.verify, accountController.changePassword);
router.post('/signup', accountController.signup); //both excel, handle
router.delete('/delete', accountController.deleteAccount); //both excel, handle
router.put('/recovery', accountController.recoveryAccount);

//profile
router.get('/profile', jwt.verify, accountController.getProfile);
router.put('/profile', jwt.verify, accountController.updateProfile);

//EXCEL

module.exports = router;

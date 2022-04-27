const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const accountController = require('../controllers/account.controller');
const searchController = require('../controllers/search.controller');

//ACCOUNT
router.post('/signin', accountController.signin);
router.post('/forgotPass', accountController.forgotPass);
router.post('/resetPass', accountController.resetPassword);
router.post('/changePass', jwt.verify, accountController.changePassword);
router.post('/signup', accountController.signup); //both excel, handle
router.delete('/delete', accountController.deleteAccount); //both excel, handle
router.put('/recovery', accountController.recoveryAccount);
router.get('/', accountController.getListAccount);
router.post('/verifyPhone', accountController.verifyPhoneNumber);

//profile
router.get('/profile', jwt.verify, accountController.getProfile);
router.put('/profile', jwt.verify, accountController.updateProfile);
//search
router.get('/search', searchController.searchUser);

router.get('/admin',jwt.verify, accountController.checkAdminSG);
router.post('/aoc',jwt.verify, accountController.addAOC);

module.exports = router;

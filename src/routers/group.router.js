const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const groupController = require('../controllers/group.controller');

//group
router.get('/main/fac', groupController.getListFaculty);
router.post('/main/fac', groupController.createFaculty);

//User
router.post('/user', groupController.addUser);
//delte one user
router.delete('/user', groupController.deleteUser);
router.delete('/listuser', groupController.deleteListUser);
//change admin
router.post('/user/admin', groupController.changeAdmin);

router.post('/user/tranfer', groupController.tranferFaculty);

//sendNotify for maingroup
router.post('/main/notify', groupController.sendNotifyForMainGroup);

router.post('/sub', jwt.verify, groupController.createSubgroup);

module.exports = router;

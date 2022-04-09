const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const groupController = require('../controllers/group.controller');
const reportController = require('../controllers/report.controller');
const searchController = require('../controllers/search.controller');

//group faculty
router.get('/main/fac', groupController.getListFaculty);
router.post('/main/fac', groupController.createFaculty);
router.put('/main/fac', groupController.updateFaculty);

//sendNotify for maingroup
router.post('/main/notify', groupController.sendNotifyForMainGroup);

//User
router.get('/user/:type/:groupId', groupController.getListUser);
router.post('/user', groupController.addUser);
router.delete('/user', groupController.deleteUser); //delete one user
router.delete('/listuser', groupController.deleteListUser); //delete listUser
router.post('/user/admin', groupController.changeAdmin);
router.post('/user/tranfer', groupController.tranferFaculty);
router.get('/user', jwt.verify, groupController.getGroupByUserId);

//Sub group
router.get('/relative', jwt.verify, groupController.getRelativeGroup);

router.get('/sub', groupController.getAllGroup);
router.post('/sub', jwt.verify, groupController.createSubgroup);
router.put('/sub', groupController.updateGroup);
router.post('/sub/report', reportController.createReportGroup);

//get for admin
router.get('/sub/report', reportController.getReportAllGroup);

router.get('/sub/search', searchController.searchGroup);

router.get('/sub/search/user', searchController.searchUserForSubGroup);
router.get('/main/search/user', searchController.searchUserForMainGroup);

module.exports = router;

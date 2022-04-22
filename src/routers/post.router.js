const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const postController = require('../controllers/post.controller');
const reportController = require('../controllers/report.controller');

//createPost
router.post('/', jwt.verify, postController.createPost);
//getDetailPost
router.get('/:postId', postController.getDetailPost);

//FOR MAIN GROUP
//getListPostbyId
router.get('/main/:groupId', jwt.verify, postController.getListPostByUserId);
router.put('/', postController.readMainNotify);
//FOR SUB GROUP
//getListPostbygroupid
router.get('/sub/:groupId', postController.getListPostByGroupId);
router.delete('/sub/:postId', postController.deletPost);
router.put('/sub/', postController.updatePost);
router.post('/sub/report', reportController.createReportPost);
router.get('/sub/report/all', reportController.getReportAllPost);
router.get('/user/all', jwt.verify, postController.getAllPostForUser);

module.exports = router;

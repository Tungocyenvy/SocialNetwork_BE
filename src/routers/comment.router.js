const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const commentController = require('../controllers/comment.controller');

//CRUD COMMENT
//read
router.get('/:postId', commentController.getComment);
//create
router.post('/', jwt.verify, commentController.createComment);
//update
router.put('/', jwt.verify, commentController.updateComment);
//delete
router.delete('/:commentId', commentController.deleteComment);

//CUD REPLY
//creat reply
router.get('/reply/:commentID', commentController.getReply);
router.post('/reply', jwt.verify, commentController.replyComment);
//update reply
router.put('/reply', jwt.verify, commentController.updateReply);
//delete reply
router.delete('/reply/:replyId', jwt.verify, commentController.deleteReply);

module.exports = router;

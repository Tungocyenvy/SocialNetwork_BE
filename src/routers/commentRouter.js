const express = require('express');
const router = express.Router();
const jwt = require('../services/jwtService');
const commentController = require('../controllers/commentController');

//CRUD COMMENT
//read
router.get('/:postId', commentController.getComment);
//create
router.post('/', jwt.verify, commentController.createComment);
//update
router.put('/', jwt.verify, commentController.updateComment);
//delete
router.delete('/:id', jwt.verify, commentController.deleteComment);

//CUD REPLY
//creat reply
router.post('/reply', jwt.verify, commentController.replyComment);
//update reply
router.put('/reply', jwt.verify, commentController.updateReply);
//delete reply
router.delete('/reply/:idCmt/:idRl', jwt.verify, commentController.deleteReply);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.Service');
const postController = require('../controllers/post.Controller');

//Tạo bài viết
router.post('/', jwt.verify, postController.createPost);

module.exports = router;

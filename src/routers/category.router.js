const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const categoryController = require('../controllers/category.controller');

router.get('/:isDelete', categoryController.getCategory);
router.put('/', categoryController.updateCategory);
router.post('/', categoryController.createCategory);

module.exports = router;

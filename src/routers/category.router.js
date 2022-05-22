const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const categoryController = require('../controllers/category.controller');

router.get('/:type/:isDelete', categoryController.getCategory);
router.put('/:type', categoryController.updateCategory);
router.post('/:type', categoryController.createCategory);

module.exports = router;

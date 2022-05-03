const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const categoryController = require('../controllers/category.controller');

//GROUP
router.get('/group/:isDelete', categoryController.getCategoryGroup);
router.put('/group', categoryController.updateCategoryGroup);
router.post('/group', categoryController.createCategoryGroup);

//REPORT
router.get('/report/:isDelete', categoryController.getCategoryReport);
router.put('/report', categoryController.updateCategoryReport);
router.post('/report', categoryController.createCategoryReport);

//POST
//REPORT
router.get('/post/:isDelete', categoryController.getCategoryPost);
router.put('/post', categoryController.updateCategoryPost);
router.post('/post', categoryController.createCategoryPost);

module.exports = router;

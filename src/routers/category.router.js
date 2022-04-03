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

module.exports = router;

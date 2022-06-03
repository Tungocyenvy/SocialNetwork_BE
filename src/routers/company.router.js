const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const companyController = require('../controllers/company.controller');
const searchController = require('../controllers/search.controller');

//ACCOUNT
router.post('/signup', companyController.signup);
router.get('/search', searchController.searchNewsCompany);
router.get('/', searchController.searchCompany);

router.post('/news',jwt.verify, companyController.createPost);
router.put('/news', companyController.updatePost);
router.delete('/news', companyController.deletePost);

router.get('/news/:newsId', companyController.getDetailPost);

router.get('/news',jwt.verify, companyController.getPostByCompanyId);
router.get('/news/:companyId/:newsId', companyController.getListPostSameCompany);

module.exports = router;

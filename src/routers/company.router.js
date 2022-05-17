const express = require('express');
const router = express.Router();
const jwt = require('../services/jwt.service');
const companyController = require('../controllers/company.controller');
const searchController = require('../controllers/search.controller');

//ACCOUNT
router.post('/signup', companyController.signup);
router.get('/search', searchController.searchCompany);

module.exports = router;

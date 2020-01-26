var express = require('express');
var router = express.Router();
var middleware = require('../middleware');


router.get('/', middleware.isLoggedIn, middleware.checkAdmin, (req, res) => {
  res.render('admincontent/administration');
});

router.get('/new/documentum', middleware.isLoggedIn, middleware.checkAdmin, (req, res) => {
  res.render('admincontent/pdfuploader');
})

router.get('/new', middleware.isLoggedIn, middleware.checkAdmin, (req, res) => {
  res.render('admincontent/newcontent');
})

router.get('/new/publicdata', middleware.isLoggedIn, middleware.checkAdmin, (req, res) => {
  res.render('admincontent/newkozadat');
})


module.exports = router;
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/', function(req, res) {
  res.redirect('/blogs');
});

// AUTHORIZATION

// Login
router.get('/login', function(req, res) {
  res.render('login');
});

// login logic
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/blogs',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Sikeres bejelentkezés!'
  }),
  function(req, res) {}
);

// Register
// router.get('/register', function(req, res) {
//   res.render('register');
// });

// handling sign up form
// router.post('/register', function(req, res) {
//   if (req.body.password === req.body.samePassword) {
//     var newUser = new User({
//       username: req.body.username,
//       email: req.body.email
//     });
//     if (req.body.username === 'Admin') {
//       newUser.isAdmin = true;
//     } else if (req.body.username === 'Guest') {
//       newUser.isGuest = true;
//     }
//     User.register(newUser, req.body.password, function(err, regUser) {
//       if (err) {
//         req.flash('error', err.message);
//         console.log(err.message);
//         res.redirect('/register');
//       } else {
//         passport.authenticate('local')(req, res, function() {
//           req.flash('success', 'Üdvözlet a BLOG-DEMO-N ' + regUser.username + '.');
//           res.redirect('/blogs');
//         });
//       }
//     });
//   } else {
//     req.flash('error', 'A két jelszó nem egyezik!');
//     res.redirect('/register');
//   }
// });

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'Sikeresen kijelentkeztél!');
  res.redirect('/blogs');
});

module.exports = router;

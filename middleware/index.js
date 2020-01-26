var Blogs = require('../models/blog');

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
  res.redirect('/login');
};

middlewareObj.checkAdmin = function(req, res, next) {
  if (req.isAuthenticated() && req.user.username === 'Admin') {
    return next();
  }
  req.flash('error', 'Ehhez a művelethez nincs jogosultságod!');
  res.redirect('/blogs');
};

middlewareObj.checkUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    Blogs.findById(req.params.id, function(err, foundBlog) {
      if (err || !foundBlog) {
        req.flash('error', 'Hiba történt. Nem található a bejegyzés.');
        res.redirect('/blogs');
      } else {
        if (foundBlog.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'Ehhez a művelethez Önnek nincs jogosultsága.');
          res.redirect('/blogs');
        }
      }
    });
  } else {
    req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
    res.redirect('/blogs');
  }
};

middlewareObj.checkAllBlogPosts = function(req, res, next) {
  Blogs.find({}, function(err, allBlog) {
    if (err || !allBlog) {
      req.flash('error', 'Nem találhatók cikkek!');
      res.redirect('/blogs');
    } else {
      blogs = allBlog;
    }
    next();
  });
};

module.exports = middlewareObj;

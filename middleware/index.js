var Blog = require('../models/blog');

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
  res.redirect('/login');
};

middlewareObj.checkAdmin = function (req, res, next) {
  if (req.isAuthenticated() && req.user.username === 'Admin') {
    return next();
  }
  req.flash("error", "Ehhez a művelethez nincs jogosultságod!");
  res.redirect("/welcome");
}

middlewareObj.checkAllBlogPosts = function (req, res, next) {
  Blog.find({}, function (err, allBlog) {
    if (err || !allBlog) {
      req.flash('error', 'Nem találhatók cikkek!')
      res.redirect('/welcome')
    } else {
      blogs = allBlog
    }
    next()
  })
}

module.exports = middlewareObj;
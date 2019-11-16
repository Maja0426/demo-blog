var express = require('express');
var router = express.Router();
var Blogs = require('../models/blog');
var middleware = require('../middleware');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Csak képfile-t lehet feltölteni!'), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'maja0426',
  api_key: '831789779817282',
  api_secret: 'A8gM9XzEuhRuLSds9Fru_l7lTz0'
});

// INDEX PAGE, LIST ALL Blogs
router.get('/', function(req, res) {
  var perPage = 12;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Blogs.find({
      title: regex
    })
      .sort({
        createdAt: -1
      })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function(err, allBlogs) {
        Blogs.countDocuments({
          title: regex
        }).exec(function(err, count) {
          if (err) {
            console.log(err);
            res.redirect('back');
          } else {
            if (allBlogs.length < 1) {
              noMatch = 'Nem találtam egyező blogbejegyzést, próbáld meg másképp.';
            }
            res.render('blogs/index', {
              blogs: allBlogs,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              noMatch: noMatch,
              search: req.query.search
            });
          }
        });
      });
  } else {
    Blogs.find({})
      .sort({
        createdAt: -1
      })
      .skip(perPage * pageNumber - perPage)
      .limit(perPage)
      .exec(function(err, allBlogs) {
        Blogs.countDocuments().exec(function(err, count) {
          if (err) {
            console.log(err);
          } else {
            res.render('blogs/index', {
              blogs: allBlogs,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              noMatch: noMatch,
              search: false
            });
          }
        });
      });
  }
});

// CATEGORIES - CATEGORY (TYPE)
router.get('/category/:id', function(req, res) {
  var perPage = 12;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  Blogs.find({
    category: req.params.id
  })
    .sort({
      createdAt: -1
    })
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec(function(err, allBlogs) {
      Blogs.countDocuments({
        category: req.params.id
      }).exec(function(err, count) {
        if (err) {
          console.log(err);
        } else {
          res.render('blogs/catindex', {
            blogs: allBlogs,
            current: pageNumber,
            category: req.params.id,
            findRoute: 'category',
            pages: Math.ceil(count / perPage),
            noMatch: noMatch,
            search: false
          });
        }
      });
    });
});

// NEW Blogs PAGE - ADDED NEW BLOGPOST
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('blogs/new');
});

// CREATE NEW Blogs
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res) {
  // req.body.blogs.description = req.sanitize(req.body.blogs.description);
  req.body.blogs.author = {
    id: req.user._id,
    username: req.user.username
  };
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the Blogs object under image property
      req.body.blogs.image = result.secure_url;
      Blogs.create(req.body.blogs, function(err, createdBlogs) {
        if (err) {
          req.flash('error', 'Valami hiba történt. Próbálja újra.');
          res.redirect('blogs');
        } else {
          req.flash('success', 'Az új bejegyzésed kész!');
          res.redirect('/blogs');
        }
      });
    });
  } else {
    req.body.blogs.image =
      'https://res.cloudinary.com/maja0426/image/upload/v1552336982/Aprohirdetes/no-image-icon-11.png';
    Blogs.create(req.body.blogs, function(err, createdBlogs) {
      if (err) {
        req.flash('error', 'Valami hiba történt. Próbálja újra.');
        res.redirect('blogs');
      } else {
        req.flash('success', 'Az új bejegyzésed kész!');
        res.redirect('/blogs');
      }
    });
  }
});

// SHOW PAGE - SHOW THE SELECTED AD
router.get('/:id', function(req, res) {
  Blogs.findById(req.params.id, function(err, foundBlog) {
    if (err || !foundBlog) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/blogs');
    } else {
      res.render('blogs/show', {
        blog: foundBlog
      });
    }
  });
});

// EDIT PAGE - EDIT THE SELECTED BLOG
router.get('/:id/edit', middleware.checkUser, function(req, res) {
  Blogs.findById(req.params.id, function(err, foundBlog) {
    res.render('blogs/edit', {
      blog: foundBlog
    });
  });
});

// UPDATE PAGE
router.put('/:id', middleware.checkUser, upload.single('image'), function(req, res) {
  // req.body.blogs.description = req.sanitize(req.body.blogs.description);
  req.body.blogs.lastModifiedAt = Date.now();
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the Blogs object under image property
      req.body.blogs.image = result.secure_url;
      Blogs.findByIdAndUpdate(req.params.id, req.body.blogs, function(err, updatedBlog) {
        if (err) {
          req.flash('error', 'Valami hiba történt. Próbálja újra.');
          res.redirect('blogs');
        } else {
          req.flash('success', 'A bejegyzésed módosítva!');
          res.redirect('/blogs');
        }
      });
    });
  } else {
    // req.body.Blogs.image = 'https://res.cloudinary.com/maja0426/image/upload/v1550587836/Aprohirdetes/NoImageFound.png';
    Blogs.findByIdAndUpdate(req.params.id, req.body.blogs, function(err, updateBlog) {
      if (err) {
        req.flash('error', 'Valami hiba történt. Próbálja újra.');
        res.redirect('/blogs');
      } else {
        req.flash('success', 'A bejegyzésed módosítva!');
        res.redirect('/blogs');
      }
    });
  }
});

// DELETE PAGE
router.delete('/:id', middleware.checkUser, function(req, res) {
  Blogs.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/blogs');
      console.log(err);
    } else {
      req.flash('success', 'Blogpost törölve!');
      res.redirect('/blogs');
    }
  });
});

// SEARCH REGEX
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;

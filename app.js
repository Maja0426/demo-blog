const express = require('express');
const methodOverride = require('method-override');
const expressSanitizer = require("express-sanitizer");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const middleware = require('./middleware');
// const sm = require('sitemap');
// const sslRedirect = require('heroku-ssl-redirect'); // SSL Redirect, must have heroku
const app = express();

const blogsRoutes = require('./routes/blog');
const indexRoutes = require('./routes/index');
// const adminRoutes = require('./routes/admin');
const User = require('./models/user');

app.locals.moment = require('moment');

mongoose.connect('mongodb://tmajoros:Tmsmajoros1977@ds147096.mlab.com:47096/smpl-blog', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'ejs');
app.use(flash());

// SITEMAP GENERATOR (ADD sitemap.xml to google console)
// var sitemap = sm.createSitemap({
//   hostname: 'https://smartbee.info',
//   cacheTime: 600000, // 600 sec - cache purge period
//   urls: [{
//     url: '/blogs/',
//     changefreq: 'daily',
//     priority: 0.3
//   }]
// });

// app.get('/sitemap.xml', function (req, res) {
//   sitemap.toXML(function (err, xml) {
//     if (err) {
//       return res.status(500).end();
//     }
//     res.header('Content-Type', 'application/xml');
//     res.send(xml);
//   });
// });

// PASSPORT CONFIG
app.use(require('express-session')({
  secret: 'I know what I want.',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(sslRedirect()); // Redirect Heroku SSl. MUST HAVE to HEROKU!!
app.use(expressSanitizer());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.pageUrl = 'https://' + req.get('host') + req.originalUrl; // SHOW actual page's URL
  next();
});

// ROUTES CONFIG
app.use('/', indexRoutes);
app.use('/blogs', blogsRoutes);
// app.use('/admin', adminRoutes);

// app.get('blogs/', (req, res) => {
//   res.render('/blogs/index');
// })

// 404 ERROR PAGE
app.get('*', function (req, res) {
  res.render('404');
});


// Listening PORT, server is running 
let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('========================================================')
  console.log(`Maja SMPL BLOG. SERVER STARTED ON PORT ${PORT}`)
  console.log('========================================================')
});
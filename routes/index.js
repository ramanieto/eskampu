//Using express to connect routes.js with app.js
var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    passport    = require("passport"),
    User        = require("../models/user"),
    Campgrounds = require("../models/campground"),
    async       = require("async"),
    nodemailer  = require("nodemailer"),
    crypto      = require("crypto");



router.get("/", function(req, res){
  Campgrounds.aggregate(
    [
        { "$project": {
            "name": 1,
            "location": 1,
            "latitude": 1,
            "longitude": 1,
            "image": 1,
            "price": 1,
            "description": 1,
            "keywords": 1,
            "author": 1,
            "comments": 1,
            "length": { "$size": "$comments" }
        }},
        { "$sort": { "length": -1 } },
        { "$limit": 6 }
    ],
    function(err,results) {
      if(err){
        console.log(err);
      } else {
        res.render("landing", {campgrounds: results});
      } 
    });
});

//Register Route
router.get("/register", function(req, res){
   res.redirect("/"); 
}); 

//Contact Route
router.get("/terms&privacy", function(req, res){
   res.render("terms&privacy"); 
}); 

//About Route
router.get("/about", function(req, res){
   res.render("about"); 
}); 

//Handle sign up logic
router.post("/register", function(req, res){
  
  
  var rand = Math.floor((Math.random() * 10000000000));
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
        if(err.code === 11000) {
          req.flash("error", "Email already exists!");
          res.redirect("/");
        } else {
          req.flash("error", err.message);
          res.redirect("/");
        }
    } else {
      passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to YelpCamp " + user.username);
          res.redirect("/profile/" + user._id); 
      });
    }  
  });
});

//Show login form
// router.get("/login", function(req, res){
//   res.redirect("/"); 
// });

//Handling login logic
//router.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), function(req, res){
});

//Logout Route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});

router.get('/forgot', function(req, res) {
  // res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'eskampuinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'eskampuinfo@gmail.com',
        subject: 'EsKampu Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'eskampuinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'eskampuinfo@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});


router.get('/auth/facebook', passport.authenticate('facebook', { display: 'popup', scope: ['email']}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
  failureRedirect: '/login', 
  successRedirect:'/campgrounds' 
  }), function(req, res) {
    res.redirect('back');
});

router.get('/auth/google', passport.authenticate('google', { display: 'popup', scope: ['profile','email']}));

router.get('/auth/google/callback', passport.authenticate('google', { 
  failureRedirect: '/login', 
  successRedirect:'/campgrounds' 
  }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('back');
});

module.exports = router;
//Using express to connect routes.js with app.js
var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    bodyParser  = require("body-parser"),
    bcrypt      = require("bcryptjs"),
    passport    = require("passport"),
    mongoose    = require('mongoose'),
    User        = require("../models/user"),
    Campgrounds = require("../models/campground"),
    async       = require("async"),
    nodemailer  = require("nodemailer"),
    crypto      = require("crypto"),
    dotEnv      = require('dotenv').config();


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

//Contact Route
router.get("/terms&privacy", function(req, res){
   res.render("terms&privacy"); 
}); 

//About Route
router.get("/about", function(req, res){
   res.render("about"); 
}); 

//Handle sign up logic
router.post('/register', function(req, res, next) {
  
  var email = req.body.email;
  var token;
  
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILEMAIL,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: email,
        from: 'Do Not Reply <do_not_reply_eskampuinfo@gmail.com>',
        subject: 'EsKampu - Please confirm account',
        html: 'Click the following link to confirm your account: http://' + req.headers.host + '/email-verification/' + token + '\n\n' + '.',
        text: 'Please confirm your account by clicking the following link: http://' + req.headers.host + '/email-verification/' + token + '\n\n' + '.'
      };
      User.findOne({ email: email }, function(err, existingUser) {
        if (err) {
          res.redirect('/')
          // return (err, null, null);
        }
        // user has already signed up and confirmed their account
        if (existingUser) {
          req.flash('error', 'You have already signed up and confirmed your account. Did you forget your password?');
          res.redirect('/');
        } else {
          var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            email_verification: token,
            email_verification_expires: Date.now() + 3600000 // 1 hour
          });
          User.register(newUser, req.body.password, function(err, newUser) {
            if (err) {
              console.log(err)
              if(err.code === 11000) {
                req.flash("error", "Email already exists!");
                res.redirect("/");
              } else {
                req.flash("error", err.message);
                return res.redirect("/");
              }
            } else {
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + email + ' with further instructions.');
                done(err, 'done');
              });
            }
          });
        }
      });
    }  
  ], function(err) {
    if (err)  return next(err);
    res.redirect('/');
  });
});

router.get('/email-verification/:token', function(req, res) {
  User.findOne({ email_verification: req.params.token, email_verification_expires: { $gt: Date.now() } }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      req.flash('error', 'URL has expired.');
      return res.redirect('/');
    }
    res.render('email-verification', {token: req.params.token});
  });
});

router.post('/email-verification/:token', function(req, res) {
  async.waterfall([
    function(done) {
      
      User.findOne({ email_verification: req.params.token, email_verification_expires: { $gt: Date.now() } }, function(err, foundUser) {
        
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: process.env.GMAILEMAIL,
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: foundUser.email,
          from: 'Do Not Reply <do_not_reply_eskampuinfo@gmail.com>',
          subject: 'EsKampu - Email verification complete',
          text: 'Hello,\n\n' +
            'This is a confirmation that your email has been verified.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          // req.flash('success', 'Email verified correctly.');
          done(err);
        });
        
        if (err) {
          return (err, null);
        }
        if (foundUser) {

          foundUser.email_verification = null;
          foundUser.email_verification_expires = null;
          foundUser.isActive = true;
          
          foundUser.save(function(err, savedUser) {
            if (err) {
              return (err, null);
            }
            req.flash("success", "Your email has been verified correctly. You can now Login!");
            res.redirect("/");
          });

        } else if(!foundUser) {
          req.flash('error', 'Verification link is invalid or has expired.');
          return res.redirect('back');
        }  
      });
    },
  ], function(err) {
  });
});

router.post("/login", function(req, res, next) {
  passport.authenticate("local",function(err, user, info){
    if (err) { return next(err) }
    if(!user) {
      req.flash("error", "You need to create an account first.");
      res.redirect('/');
    } else if (user) {
      if (!user.isActive) { 
        console.log(user)
        req.flash("error", "You need to confirm your account first! Check your email for further instructions.");
        res.redirect('/');
    } else {
      req.logIn(user, function(err) {
        if (err) { 
          return next(err); 
        }
        res.redirect('/campgrounds');
      });
    }   
    }
    
  })(req, res, next);
});

//Logout Route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});

//Forgot post for recovering email
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
          user: process.env.GMAILEMAIL,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'Do Not Reply <do_not_reply_eskampuinfo@gmail.com>',
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
//Render reset page
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    res.render('reset', {token: req.params.token});
  });
});
//Resets password
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        } else if (!user.isActive) {
          req.flash('error', 'You need to confirm your account first');
          return res.redirect('/');
        } else {
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                done(err, user);
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILEMAIL,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'Do Not Reply <do_not_reply_eskampuinfo@gmail.com>',
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
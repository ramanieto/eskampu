//Using express to connect routes.js with app.js
var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    passport    = require("passport"),
    User        = require("../models/user"),
    Campgrounds = require("../models/campground");



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
router.get("/contact", function(req, res){
   res.render("contact"); 
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
router.get("/login", function(req, res){
   res.redirect("/"); 
});

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
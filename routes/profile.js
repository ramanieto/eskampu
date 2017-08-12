var express    = require("express"),
    router     = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    middleware = require("../middleware"),
    mongoose   = require("mongoose"),
    ObjectId   = require('mongoose').Types.ObjectId,
    User       = require("../models/user");

//Show Profile
router.get("/:user_id", function(req, res){
  //find the campground with provided ID
  Campground.find({"author.id": ObjectId(req.params.user_id)}, function(err, foundCampground){
    if(err) {
      console.log(err);
    } 
    if (!foundCampground.length) {
        User.findById(ObjectId(req.params.user_id), function(err, user){
          if (err) {
            console.log(err);
          } else {
            res.render("profile/show", {user: user});
          }  
        });
    } else {
      res.render("profile/show", {user: foundCampground[0].author, campgrounds: foundCampground});
    }
  });
});

//Edit Profile
router.get("/:user_id/edit", middleware.checkUserOwnership, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if(err){
          console.log(err);
        }
        res.render("profile/edit", {user: foundUser});     
    });
});

//Update Profile
router.put("/:user_id", middleware.checkUserOwnership, function(req, res){
  User.findByIdAndUpdate(req.params.user_id, req.body.updated, function(err, updatedUser){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/profile/" + req.params.user_id);
      }
  }); 
});

module.exports = router;

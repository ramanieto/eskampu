var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
//All the middleware goes here
var middlewareObj = {};

//Middleware to check if user owns post
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               req.flash("error", "Campground not found");
               res.redirect("back");
           } else {
               if(foundCampground.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to login!");
        res.redirect("back");
    }
};
//Middleware to check if user owns comment
middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           } else {
               if(foundComment.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to login!");
        res.redirect("back");
    }
};


//checks user ownership
middlewareObj.checkUserOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        User.findById(req.params.user_id, function(err, foundUser){
           if(err){
               res.redirect("back");
           } else {
                console.log(foundUser);
               if(foundUser._id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to login!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to login!");
    console.log(res.body)
    res.redirect("/");
};

module.exports = middlewareObj;
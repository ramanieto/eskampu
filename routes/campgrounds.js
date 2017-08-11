//Using express to connect routes.js with app.js
var mongoosePaginate  = require("mongoose-paginate"),
    express           = require("express"),
    router            = express.Router({mergeParams: true}),
    Campground        = require("../models/campground"),
    middleware        = require("../middleware"),
    geocoder          = require("geocoder"),
    moment            = require('moment'),
    paginate          = require("express-paginate"),
    User              = require("../models/user");



//INDEX route
router.get("/", function(req, res, next){
  //Get all campgrounds from DB
  Campground.paginate({}, {page: req.query.page, limit: 12}, function(err, allCampgrounds){
    if(err){
      return next(err);
    } else {
      res.format({
        html: function() {
          res.render('campgrounds/index', {
            currentPage: req.query.page,
            campgrounds: allCampgrounds.docs,
            pageCount: allCampgrounds.pages,
            itemCount: allCampgrounds.total,
            pages: paginate.getArrayPages(req)(100, allCampgrounds.pages, req.query.page)
          });
        }
        ,
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(allCampgrounds.pages),
            data: allCampgrounds.docs
          });
        }
      });
    }
  });
});

//CREATE - add a new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  //get data from form and add it to array 
  var name = req.body.name;
  var location = req.body.location;
  var image = req.body.image;
  var price = req.body.price;
  var description = req.body.description;
  var keywords = req.body.keywords;
  
  var author = {
    id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    profilePic: req.user.profilePic
  };
  
  var newCampground = 
    {
      name: name,
      location: location,
      image: image,
      price: price,
      description: description,
      keywords: keywords,
      author: author
    };
      
  // Geocode location
  geocoder.geocode(location, function(err, data) {
    if(err) {
      res.render('campgrounds/new', {err: ["Location is not valid"]});
    } else {
      newCampground.latitude = data.results[0].geometry.location.lat;
      newCampground.longitude = data.results[0].geometry.location.lng;
      newCampground.location = data.results[0].formatted_address;
      //Create a new campground and save to DB
      Campground.create(newCampground, function(err, newlyCreated){
        if(err){
          console.log(err);
        } else {
          //redirect to campgrounds page
          res.redirect("/campgrounds");
        }
      });
    }  
  });
});

// NEW - show the form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

// SHOW - shows more info about that campground
router.get("/:id", function(req, res){
   //find the campground with provided ID
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err){
        console.log(err);
      } else {
        //render show template with that campground
        res.render("campgrounds/show", {campground: foundCampground});    
      }
   });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
          console.log(err);
        }
        res.render("campgrounds/edit", {campground: foundCampground});     
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   //find and update the correct campground
    //Get values to update campground from edit form 
    var name = req.body.name;
    var location = req.body.location;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    //creates a new object with values of the edit form
    var campgroundNewValues = {
        name: name,
        location: location,
        image: image,
        price: price,
        description: description
    };
    //it adds lat and lng with geocoder to campgroundNewValues   
    geocoder.geocode(location, function(err, data) {
      if(err) {
        console.log(err);
      } else { 
        campgroundNewValues.latitude = data.results[0].geometry.location.lat;
        campgroundNewValues.longitude = data.results[0].geometry.location.lng;
        campgroundNewValues.location = data.results[0].formatted_address;
        // finds campground in DB by id and updates it with new values
        Campground.findByIdAndUpdate(req.params.id, campgroundNewValues, function(err, updatedCampground){
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id);  
            }            
        });
      }  
    });
    
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      } 
    });   
});

module.exports = router;
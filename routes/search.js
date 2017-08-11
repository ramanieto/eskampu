//Using express to connect routes.js with app.js
var express    = require("express"),
    router     = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    paginate   = require("express-paginate"),
    geocoder   = require("geocoder");


//INDEX route
router.get("/results", function(req, res, next){
  //Get all campgrounds from DB
  var search = req.query.search;
  if (req.query.option === "all" || req.query.option === undefined){
    Campground.paginate({$text: {$search: search}}, {page: req.query.page, limit: 12}, function(err, allCampgrounds){
    if(err){
      return next(err);
    } else {
      res.format({
        html: function() {
          res.render('campgrounds/results', {
            search: search,
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
  } else if (req.query.option === "name"){
    Campground.paginate({ "name" : { $regex : new RegExp(search, "i") }}, {page: req.query.page, limit: 12}, function(err, allCampgrounds){
      if(err){
        return next(err);
      } else {
        res.format({
          html: function() {
            res.render('campgrounds/results', {
              search: search,
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
  } else if (req.query.option === "location"){
    Campground.paginate({ "location" : { $regex : new RegExp(search, "i") }}, {page: req.query.page, limit: 12}, function(err, allCampgrounds){
      if(err){
        return next(err);
      } else { 
        res.format({
          html: function() {
            res.render('campgrounds/results', {
              search: search,
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
  }
});




module.exports = router;
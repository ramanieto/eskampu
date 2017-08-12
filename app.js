var methodOverride   = require("method-override"),
    express          = require('express'),
    session          = require('express-session'),
    LocalStrategy    = require("passport-local").Strategy,
    bodyParser       = require('body-parser'),
    mongoose         = require("mongoose"),
    Campground       = require("./models/campground"),
    Comment          = require("./models/comment"),    
    flash            = require("connect-flash"),
    passport         = require("passport"),
    multer           = require("multer"),
    User             = require("./models/user"),
    cookieParser     = require("cookie-parser"),
    paginate         = require("express-paginate"),
    FacebookStrategy = require("passport-facebook").Strategy,
    GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy,
    expressValidator = require("express-validator");

 
//Requiring routes    
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index"),
    searchRoutes     = require("./routes/search"),
    profileRoutes    = require("./routes/profile");
    

//Connecting mongoose to the DB
// mongoose.connect("mongodb://localhost/yelp_camp_v12");
mongoose.connect("mongodb://rama:lioneljoey@ds143900.mlab.com:43900/eskampu");


// Init app
var app = express();

//Express Pagination
app.use(paginate.middleware(8, 12));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


//View Engine
app.set("view engine", "ejs");
app.set("views", (__dirname, "views"));

//Set Static Folder
app.use(express.static(__dirname + "/public"));


app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(session({
    secret: "I do not understand what is this for",
    resave: false,
    saveUninitialized: false
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Valdator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root        = namespace.shift()
      , formParam   = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Facebook Strategy and Logic
var FACEBOOK_APP_ID = '1617903338238350';
var FACEBOOK_APP_SECRET= 'f9b223efdd87f37689dc2905d96ca536';

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    // callbackURL: 'http://webdevbootcamp2-ramanieto.c9users.io:80/auth/facebook/callback',
    callbackURL: 'https://wwww.eskampu.com/auth/facebook/callback',
    enableProof: true,
    profileFields: ['displayName','id', 'first_name', 'gender', 'last_name', 'picture.type(large)', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function(){
      User.findOne({ username: profile.displayName }, function (err, user) {
        if(err) 
          return cb(err);
        if(user && user.facebook.id === undefined) {
          // console.log(user)
          // return cb(null, user);
          user.facebook.id = profile.id,
          user.facebook.token = accessToken,
          user.facebook.name = profile.displayName,
          user.facebook.profilePic = profile.picture,
          user.facebook.email = profile.emails[0].value
          
          user.save(function(err, updatedUser){
            if(err) {
              console.log(err);
            } else {
              console.log(updatedUser);
            }
          });
        } 
        if(user && user.facebook.id !== undefined){
          return cb(null, user);
        } else {
          var newUser = new User({
            name: profile.displayName,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            'facebook.id': profile.id,
            'facebook.token': accessToken,
            'facebook.name': profile.displayName,
            'facebook.profilePic': profile.picture,
            'facebook.email': profile.emails[0].value
          });
          newUser.save(function(err){
            if(err)
              throw err;
            return cb(null, newUser);  
          });
        }  
      });
    });
  })
);
//End of Facebook Strategy

//Google Strategy and Logic
var GOOGLE_APP_ID = '29998186893-dhbdgp80ssot65vj965ejaskemnt8jph.apps.googleusercontent.com';
var GOOGLE_APP_SECRET= 'bqlcPdcly_J2IiGj4A1B3UBK';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_APP_ID,
    clientSecret: GOOGLE_APP_SECRET,
    // callbackURL: 'http://webdevbootcamp2-ramanieto.c9users.io/auth/google/callback',
    callbackURL: 'https://wwww.eskampu.com/auth/google/callback',
    enableProof: true,
    profileFields: ['displayName','id', 'first_name', 'gender', 'last_name', 'picture', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function(){
        var pic = profile.photos[0].value;
        var updatedPic = pic.split("?")[0];
      User.findOne({ email: profile.emails[0].value }, function (err, user) {
        if(err) 
          return cb(err);
        if(user && user.google.id === undefined) {
          user.google.id = profile.id,
          user.google.token = accessToken,
          user.google.name = profile.displayName,
          user.google.profilePic = updatedPic,
          user.google.email = profile.emails[0].value
          
          user.save(function(err, updatedUser){
            if(err) {
              console.log(err);
            } else {
              console.log("is this it-----------"+updatedUser);
            }
          });
        } 
        if(user && user.google.id !== undefined){
          return cb(null, user);
        } else {
          var newUser = new User({
            name: profile.displayName,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePic: updatedPic,
            'google.id': profile.id,
            'google.token': accessToken,
            'google.name': profile.displayName,
            'google.profilePic': updatedPic,
            'google.email': profile.emails[0].value
          });
          newUser.save(function(err){
            if(err)
              throw err;
            return cb(null, newUser);  
          });
        }  
      });
    });
  })
);
//End of Google Strategy

//Connect Flash
app.use(flash());


// Global Variables for Connect Flash
app.use(function (req, res, next){
   res.locals.currentUser = req.user || null;
   //flash messages
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use(indexRoutes);
app.use("/profile", profileRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id", commentRoutes);
app.use("/search", searchRoutes);

//Server
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("****SERVER IS RUNNING FOR V20****");
});



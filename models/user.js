var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.Promise = global.Promise;

var UserSchema = new mongoose.Schema({
  username: { 
    type: String,
    unique: [true, 'username already exists'],
    required: [true, 'username is required']
  },
  name: {
    type: String
  },
  password: {
    type: String
  },
  email:{
    type: String,
    trim: true,
    lowercase: true,
    unique: [true, 'email already exists'],
    required: [true, 'Email required']
  },
  profilePic: {
    type: String, 
    default: 'https://thesocietypages.org/socimages/files/2009/05/vimeo.jpg'
  },
  campground: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Campground"
        },
        name: String,
        image: String
      }  
  ],
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    profilePic: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
    profilePic: String
  },
  liked_campgrounds: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
      }
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date
  // active: false,
  // email_confirmation_hash: String
});

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);
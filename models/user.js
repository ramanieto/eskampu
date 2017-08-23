var passportLocalMongoose = require("passport-local-mongoose"),
    mongoose              = require("mongoose"),
    bcrypt                = require("bcryptjs");

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
  isActive: false,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  email_verification: String,
  email_verification_expires: Date
});

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);
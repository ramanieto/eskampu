var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var commentSchema = new mongoose.Schema({
   text:String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
    username: String,
    profilePic: String
   },
   campground: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campgrounds"
      }
   },  
}, {timestamps: true});
// 
module.exports = mongoose.model("Comment", commentSchema);

  
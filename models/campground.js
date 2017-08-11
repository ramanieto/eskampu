var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
mongoose.Promise = global.Promise;

//Schema set up
var campgroundSchema = new mongoose.Schema({
    name: String,
    location: String,
    latitude: String,
    longitude: String,
    image: String,
    price: String,
    description: String,
    keywords: [String],
    likes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],  
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      name: String,
      profilePic: String,
      email: String,
      username: String
    },
    comments: [
      { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
});

campgroundSchema.plugin(mongoosePaginate);

campgroundSchema.index({'$**': 'text', name: 'text', location: 'text', price: 'text', 'author.username': 'text'});

//Adding the methods to the Schema
module.exports = mongoose.model("Campground", campgroundSchema);

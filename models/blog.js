var mongoose = require('mongoose');

var blogsSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  image: String,
  imageId: String,
  category: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModifiedAt: Date
});


module.exports = mongoose.model('Blogs', blogsSchema);
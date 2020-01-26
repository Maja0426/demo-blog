var mongoose = require('mongoose');

var blogsSchema = new mongoose.Schema({
  title: String,
  subTitle: String,
  image: String,
  imageId: String,
  category: String,
  description: String,
  writer: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  lastModifiedAt: Date
});

module.exports = mongoose.model('Blogs', blogsSchema);

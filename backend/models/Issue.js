const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  image: String,
  votes: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Issue', IssueSchema);

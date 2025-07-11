const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  carname: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  coverImage: {
    type: String 
  },
  status:{
    type:String,
    enum:["approved","pending","rejected"],
    default:"pending"
  }

});

module.exports = mongoose.model('Car', CarSchema);

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var updateSchema = new Schema({
  user: String,
  room: String,
  budget: String,
  timeLine:  String,
  style: String,
  image: String,
  specialReqs: String,
  questsAnsd: Number,
  archived: Boolean,
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Update', updateSchema);

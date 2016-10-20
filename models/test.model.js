"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Chalk = require('chalk');

var TestSchema = new Schema({
  name: String,
  summary: String,
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }

});

TestSchema.pre('save', function(next) {
  console.log(Chalk.green("[NOTICE] Test saved"));
  next();
});

mongoose.model('test', TestSchema, 'test');
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Chalk = require('chalk');

var UserSchema = new Schema({
  username: String,
  password: String,
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }

});

UserSchema.pre('save', function(next) {
  console.log(Chalk.green("[NOTICE] Member saved"));
  next();
});

mongoose.model('member', UserSchema, 'member');
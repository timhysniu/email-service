"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Chalk = require('chalk');

var CourseSchema = new Schema({
  courseId: String,
  title: String,
  description: String,
  thumbnailUrl: String,
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

CourseSchema.pre('save', function(next) {
  console.log(Chalk.green("[NOTICE] Course saved"));
  next();
});

mongoose.model('course', CourseSchema, 'course');
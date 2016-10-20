const Joi = require('joi');
var app = require('../server');

var courseDetails = {
  method: 'GET',
  path: '/course/{name}',
  handler: function(request, reply) {
    app.controllers.course.courseDetails(request, reply);
  },
  config: {
    validate: {
      params: {
        name: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
      }
    }
  }
}

var courseList = {
  method: 'GET',
  path: '/courses',
  handler: function(request, reply) {
    app.controllers.course.courseList(request, reply);
  }
}

module.exports = [
  courseDetails,
  courseList
];
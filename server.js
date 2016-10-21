'use strict'

const Hapi = require('hapi');
const Joi = require('joi');
const Path = require('path');
const Inert = require('inert');
const Good = require('good');
const Promise = require('bluebird');
const Glob = require('glob');
const Chalk = require('chalk');
const Config = require('config');
const memjs = require('memjs');

// init memcached
var mc = memjs.Client.create('localhost:11211');
GLOBAL.mc = memjs.Client.create('localhost:11211');
GLOBAL.mc.set('foo', 'asd');

// bootstrap controllers
var controllerFiles = Glob.sync("controllers/**/*.js");
var controllers = [];
controllerFiles.forEach(function (path) {
  var controllerName = path.replace('controllers/', '').replace('.controller.js', '');
  var controller = require(Path.resolve(path));

  controllers[controllerName] = controller;
});

module.exports.controllers = controllers;

// create hapi server
const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});

server.connection({
  host: Config.app.server.hostname,
  port: Config.app.server.port
});

// static resources
server.register(Inert, () => {});

// monitoring
server.register({
  register: Good,
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      }, {
        module: 'good-console'
      }, 'stdout']
    }
  }
});

server.register({
    register: require('hapi-server-session'),
    options: {
        cookie: {
            isSecure: false,
        },
    },
}, function (err) { if (err) { throw err; } });

// routing and views
server.register(require('vision'), function(err) {
  if(err) {
    throw err;
  }

  var routes = Glob.sync("routes/**/*.js");
  routes.forEach(function (routePath) {
    var routeObj = require(Path.resolve(routePath));
    server.route( routeObj );
  });


  // views config using vision
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views',
    partialsPath: './views/partials',
    layout: true,
    layoutPath: './views/layout',
    helpersPath: './views/helpers'
  });

    var io = require('socket.io')(server.listener);
    io.on('connection', function (socket) {
        console.log('client connected');
        socket.emit('serverInit', {'init': 1});
    });

  server.start(function() {
    console.log('Server running at: ', server.info.uri);
  });
});

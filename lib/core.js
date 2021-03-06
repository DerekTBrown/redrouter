/*eslint-env node */
'use strict';

// Imports
var async = require("async");
var _ = require('lodash');

// RedRouter
var RedRouter = {};
    RedRouter.agent = require('./agent');
    RedRouter.backend = require('./backend');
    RedRouter.resolver = require('./resolver');
    RedRouter.middleware = require('./middleware');
    RedRouter.utils = require('./utils');

var utils = RedRouter.utils;

// Process Manager
var router_instances = [];

/**
    Creates a RedRouter Server Instance
**/
RedRouter.create = function(opts){
    var _this = this;
    router_instances.push(_this);

  // Start Logging
    var winston = require('winston');
     _this.winston = winston;
     _this.log = _this.winston.log;

  // Create Component Arrays
    _this.resolvers = [];
    _this.middleware = [];
    _this.agents = [];

  // Load Backend
    if (opts.backend !== undefined){
      _this.backend = utils.constructorApply(opts.backend.constructor,[_this, opts.backend.options]);
    }
    else{
      _this.backend = new require('./backend.js')(_this, opts.backend_opts);
    }

  // Load Encryption
    if (typeof opts.ssl !== undefined){
      _this.ssl = _.defaults(opts.ssl, {
        NPNProtocols: ['http/2.0', 'spdy', 'http/1.1', 'http/1.0']
      });
    }

  // Load Resolvers
    if(typeof opts.resolvers !== "undefined"){
      opts.resolvers.forEach(function(rsl){
        if (typeof rsl === "function"){
          _this.resolvers.push(utils.constructorApply(rsl,[_this, opts.resolver_opts]));
        }
        else{
          rsl.options = rsl.options || {};
          _this.resolvers.push(utils.constructorApply(rsl.constructor,[_this, rsl.options]));
        }
      });
    }

  // Load Middleware
    if(typeof opts.middleware !== "undefined"){
      opts.middleware.forEach(function(mdw){
        if (typeof mdw === "function"){
          _this.middleware.push(utils.constructorApply(mdw,[_this, opts.middleware_opts]));
        }
        else{
          mdw.options = mdw.options || {};
          _this.middleware.push(utils.constructorApply(mdw.constructor,[_this, mdw.options]));
        }

      });
    }

    /**
      HTTP / HTTPS Server Functions

      Because of the number of components which rely on the HTTP server,
      created a function to enable sharing this server across components.
    **/
      var HTTPServer = this.HTTPServer = [];
      this.getHTTP = function(port = 80){
        if(typeof HTTPServer[port] === "undefined" || HTTPServer[port] === null){
          HTTPServer[port] = require('http').createServer().listen(port, function(){
              _this.log('info','listening on http port ' + port);
          });
          return HTTPServer[port];
        }
        else{
          return HTTPServer[port];
        }
      }
      var HTTPSServer = this.HTTPSServer = [];
      this.getHTTPS = function(port = 443){
        if(typeof HTTPSServer[port] === "undefined" || HTTPSServer[port] === null){
          HTTPSServer[port] = require('https').createServer(_this.ssl).listen(port, function(){
              _this.log('info','listening on https port ' + port);
          });
          return HTTPSServer[port];
        }
        else{
          return HTTPSServer[port];
        }
      }

  // Load Proxy Agents
    if(typeof opts.agents !== "undefined"){
      opts.agents.forEach(function(svr){
        if(typeof svr === "function"){
          _this.agents.push(utils.constructorApply(svr,[_this, opts.agents_opts]));
        }
        else{
          svr.options = svr.options || {};
          _this.agents.push(utils.constructorApply(svr.constructor,[_this, svr.options]));
        }
      });
    }

  /**
    Resolve Function

    Does an in-order traversal of the resolvers, and evaluates
    to the first route passed back from each resolver
  **/
    this.resolve = function(req, callback){
      async.forEachOf(_this.resolvers,function(res, priority, cb1){
        if(typeof opts.resolver_opts === "undefined"){
          opts.resolver_opts = {};
        }

        opts.resolver_opts.priority = priority;
        res.resolve(req, opts.resolver_opts, cb1);
      },
      function(record){
        if (record != null){
          async.reduce(_this.middleware, record, function(rcd, mdw, cb2){
            if(typeof opts.middleware_opts === "undefined"){
              opts.middleware_opts = {};
            }

            mdw.resolve(rcd, opts.middleware_opts, cb2);
          }, function(err, result){
            if(!err){
              callback(result);
            } else {
              callback(null);
            }
          });
        }
        else{
          callback(null);
        }
      });
    }

  /**
    Destroy Function

    Runs the provided destroy method on all subcomponents
  **/
    this.destroy = function(){
      var _this = this;

      // Destroy Server Agents
      if (typeof _this.agents != "undefined"){
        _this.agents.forEach(function(obj){
          obj.destroy();
        });
      }

      // Destroy Middleware
      if (typeof _this.middleware != "undefined"){
        _this.middleware.forEach(function(obj){
          obj.destroy();
        });
      }

      // Destroy Backend
      _this.backend.destroy();

      // Destroy Resolvers
      if (typeof _this.resolvers != "undefined"){
        _this.resolvers.forEach(function(obj){
            obj.destroy();
        });
      }
    }

}

/**
  Cleanup Function
**/
function cleanup(err){

  // Print Errors
  if (err){
    console.log(err.stack);
  }

  console.log("\n\n");

  // Clean Running Servers
  console.log("Cleaning Up... Don't Exit.");
  router_instances.forEach(function(instance){
    instance.destroy();
  });

  console.log("Done!");

  // Exit
   process.exit();
}
  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);

/**
  Module Exports
**/
  module.exports = RedRouter;

/*eslint-env node */
'use strict';

// Imports
var async = require("async");

// RedRouter
var RedRouter = {};
    RedRouter.agent = require('./agent');
    RedRouter.backend = require('./backend');
    RedRouter.resolver = require('./resolver');
    RedRouter.middleware = require('./middleware');
    RedRouter.utils = require('./utils');
    RedRouter.create = "test";

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
     _this.winston = _this.winston;
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
      _this.ssl = opts.ssl;
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
      async.forEachOf(_this.resolvers,function(res, priority1, cb1){
        if(typeof opts.resolver_opts === "undefined"){
          opts.resolver_opts = {};
        }

        opts.resolver_opts.priority = priority1;
        res.resolve(req, opts.resolver_opts, cb1);
      },
      function(record){
        if (record != null){
          async.forEachOfSeries(_this.middleware, function(mdw, priority2, cb2){
            if(typeof opts.middleware_opts === "undefined"){
              opts.middleware_opts = {};
            }

            opts.middleware_opts.priority = priority2;
            mdw.resolve(record, opts.middleware_opts, cb2);

          }, function(route){
            callback(route);
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

/**
  Docker Middleware component for RedRouter
**/

// Imports
var Dolphin = require('dolphin');

/**
  Creates a Resolver
**/
var _super = require('redrouter').middleware.prototype;
var method = Docker.prototype = Object.create( _super );
    method.constructor = Docker;


function Docker(redrouter, opts){
   _super.constructor.apply(this, arguments);

  // Save log
  this.log = redrouter.log;

  // Start Dolphin Instance
  this.dolphin = new Dolphin(opts.docker_url, opts.docker_args);

  return this;
}

/**
  Resolve Method

  req -> request information
  opts -> global resolver Options
  callback -> call with null if not resolved
              call with route if resolved
**/
method.resolve = function(record, opts, callback){
  var _this = this;

  // Check if Docker Record
  if (typeof record.docker_container !== "undefined" && typeof record.host === "undefined"){
    // Query Existing Docker Containers for
    _this.dolphin.containers.inspect(record.docker_container).then(function(container){

      // Set IP Address
      record.host = container.NetworkSettings.IPAddress;
      if (typeof record.host !== "undefined"){
        callback(record);
      }
      else{
        callback(null);
      }

    }).catch(function(err){
      _this.log('warn', err);
    })

  }
  else{
    callback(record);
  }

}
/**
  Destroy Method
**/
method.destroy = function(){

}

module.exports = Docker;

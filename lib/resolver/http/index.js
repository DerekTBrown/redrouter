/**
  Creates an SSH2 Connection Object based on an SSH2 Authentication Context
**/

// Imports
var httpUtils = require('../../agent/http/util.js');

/**
  Creates a Resolver
**/
var _super = require('redrouter').resolver.prototype;
var method = HTTPResolver.prototype = Object.create( _super );
    method.constructor = HTTPResolver;


function HTTPResolver(redrouter, opts){
   _super.constructor.apply(this, arguments);

  // Save Redrouter instance
  this.backend = redrouter.backend;

  return this;
}

/**
  Resolve Method

  req -> request information
  opts -> global resolver Options
  callback -> call with null if not resolved
              call with route if resolved
**/
method.resolve = function(req, opts, callback){

  // Parse Request
  var host;
  if (req.headers.host || req.resolver == "http" || req.resolver == "https"){
    host = req.headers.host.split(':')[0];
  }
  else {
    callback(null);
  }

  // Retrieve Record
  var record;
  if (typeof host === "string"){
    this.backend.retrieveRecord("HTTP::"+host, function(err, res){
      if(err){
        this.log('warn', err);
        callback(null);
      }
      else{
        callback(res);
      }
    });
  }
  else{
    callback(null);
  }

}
/**
  Destroy Method
**/
method.destroy = function(){

}

module.exports = SSH_Username;

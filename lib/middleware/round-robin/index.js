/**
  Round-Robin Middleware Component for RedRouter
**/

// Imports
var NodeCache = require('node-cache');

/**
  Creates a Resolver
**/
var _super = require('redrouter').middleware.prototype;
var method = RoundRobin.prototype = Object.create( _super );
    method.constructor = RoundRobin;


function RoundRobin(redrouter, opts){
   _super.constructor.apply(this, arguments);

  // Save log
  this.log = redrouter.log;

  // Create Round-Robin Cache
  this.cache = new NodeCache();

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

  if (!record.hosts || record.hosts.length <= 0){
    callback(null,record);
  }
  else if(record.target){
     _this.cache.get(record.target, function(err, value){
        if(!err){
          callback(err, null);
        } else if (!err && (typeof value === "undefined" || value === null)) {
           var index = 0;
        } else {
           var index = value % record.hosts.length;
        }

        // Update Round-Robin Cache
        _this.cache.set(record.target, (index + 1) % record.host.length , function(err, success){
          if(err){
            _this.log('warn', err);
          }
        });

        callback(null, index);
     })
  }
  else{
    _this.log('warn','target not specified');
    callback(new Error("target not specified"), null);
  }
}
/**
  Destroy Method
**/
method.destroy = function(){

}

module.exports = RedRobin;

/**
  Describes a RedRouter middleware element
**/

/**
  Creates a Middleware Component
**/
var method = Middleware.prototype;
function Middleware(redrouter, opts){
  this.log = redrouter.log;

  return this;
}

/**
  Resolve Method
**/
method.resolve = function(record, opts, callback){
  callback(null, record);
}

module.exports = Middleware;

/**
  Destroy Method
**/
method.destroy = function(){

}

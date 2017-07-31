/**
  An Interface to the Internal Record Cache
**/

// Imports

var NodeCache = require('node-cache');

/**
  Constructor for Internal Cache
**/
function Backend(redrouter, opts){
  this.log = redrouter.log;

  var set_TTL = opts.TTL || 0;
  var set_checkperiod = opts.checkperiod || 600;

  this.ncache = new NodeCache({ stdTTL : set_TTL, checkperiod : set_checkperiod});

  return this;
}

/**
  Formats and Validates a Record
**/
Backend.prototype.formatRecord = function(target, record){
  return { key : target, value : record };
}

/**
  Adds a Proxy Record
  Target -> Target String
  Record -> Proxy Record
  CB -> Callback; should handle errors;
**/
Backend.prototype.addRecord = function(target,record,cb){
  var json = this.formatRecord(target, record);

  this.ncache.set(json.key, json.value, function(err, res){
    cb(err,res);
  });
}

/**
  Removes a Proxy Record
  Target -> Protocol string to remove
  CB -> Callback; should handle errors;
**/
Backend.prototype.removeRecord = function(target, cb){
  this.ncache.del(target, function(err,count){
    cb(err,count);
  });
}

/**
  Retrieves a Proxy Record
  Target -> Target to Retrieve
  CB -> Callback;  Returns err if infrastructure-layer error and record,
                   which is null if not found.
**/
Backend.prototype.retrieveRecord = function(target, cb){
  this.ncache.get(target,cb, false);
}

/**
  Outputs all Proxy Records Synchronously
**/
Backend.prototype.getAll = function(){
  return this.ncache.keys();
}

/**
  Destroys the the RedRouter Instance
**/
Backend.prototype.destroy = function(){
  this.ncache.close();
}

module.exports = Backend;

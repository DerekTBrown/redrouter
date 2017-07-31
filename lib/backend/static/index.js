/**
  Static  Backend for RedRouter
**/

// Imports
var _ = require('lodash');

// Create Super Object
var _super = require('redrouter').backend.prototype;
var method = StaticBackend.prototype = Object.create( _super );
    method.constructor = StaticBackend;

/**
  Creates a Static Backend Object

**/
function StaticBackend(redrouter, opts){
    _super.constructor.apply(this, [redrouter, opts]);
    _.forEach(opts.records, (record, target) => {
        this.addRecord(target, record, () => {
          console.log("Added " + target);
        });
    });
}

/**
  Adds a Proxy Record
  Target -> Target String
  Dest -> Array of Destination Addresses.
  CB -> Callback; should handle errors;
**/
method.addRecord = function(target,dest,cb){
  _super.addRecord.apply(this, [target, dest, cb]);
}

/**
  Removes a Proxy Record
  Target -> String describing Address
  CB -> Callback: should handle errors;
**/
method.removeRecord = function(target, cb){
  _super.removeRecord.apply(this,[target, cb]);
}

/**
  Retrieves a Proxy Record
  Target -> Target to Retrieve
**/
method.retrieveRecord = function(target, cb){
  _super.retrieveRecord.apply(this,[target,cb]);
}


module.exports = StaticBackend;

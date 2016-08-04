/**
  ETCD Backend for RedRouter
  Automatically queries ETCD Instance for records
**/

// Imports
var Etcd = require('node-etcd');

// Create Super Object
var _super = require('redrouter').backend.prototype;
var method = ETCDBackend.prototype = Object.create( _super );
    method.constructor = ETCDBackend;

/**
  Creates an ETCD Backend Object

  opts.etcd_host -> String or Array of ETCD Instances
  opts.etcd_dir -> etcd directory to look for records
  opts.etcd_conn_opts -> Options for node-etcd connection (see GitHub)
  opts.etcd_req_opts -> Options for node-etcd set and get requests
  opts.* -> See backend.js

  cb -> Callback; handles errors

**/
function ETCDBackend(redrouter, opts){
    _super.constructor.apply(this, [redrouter, opts])
    var _this = this;

    // Create ETCD Connection
    this.etcd = new Etcd(opts.etcd_hosts, opts.etcd_conn_opts);
    this.etcd_dir = opts.etcd_dir || 'redrouter';
    this.etcd_req_opts = opts.etcd_req_opts || {};

    // Success Callback
    var finalize = function() {
        return this;
    }

    // Create Directory if not Created
    this.etcd.get(this.etcd_dir,function(err, body, header){
      if (err && err.errorCode == 100){
        _this.etcd.mkdir(_this.etcd_dir, function(err){
          if(err){
            redrouter.log("error","Could not create ETCD Directory.");
          }
          else{
            finalize();
          }
        });
      }
      else if (!err && body.node.dir){
        finalize();
      }
      else{
        redrouter.log("error", err);
      }
    });


}

method.formatETCDKey = function(target){

  //TODO URL Safe Validation
    return this.etcd_dir + "/" + target;

}

/**
  Adds a Proxy Record
  Target -> String describing SSH Address
  Dest -> Array of Destination Addresses.
  Opts -> Array of Options
  CB -> Callback; should handle errors;
**/
method.addRecord = function(target,dest,opts,cb){
  var _this = this;

  var record = this.formatRecord(target, dest, opts);
      record.key = formatETCDKey(record.key);

  // Add to Cache
  _super.addRecord.apply(this, [target, dest, opts, function(err, success){
      if (!err && success){
        // Add to ETCD
        _this.etcd.set(record.key, record.value, _this.etcd_req_opts, function(err, res){
            cb(err, res);
        });
      }
      else{
        cb(err, success);
      }
  }]);
}

/**
  Removes a Proxy Record
  Target -> String describing SSH Address
  CB -> Callback: should handle errors;
**/
method.removeRecord = function(target, cb){
  var _this = this;

  // Remove from Cache
  _super.removeRecord.apply(this,[target, function(){

      // Format ETCD Directory String
      var etcd_url = formatETCDKey(target);

      // Remove from ETCD
      _this.etcd.del(etcd_url, _this.etcd_req_opts, function(err, res){
          cb(err, res);
      });

  }]);
}

/**
  Retrieves a Proxy Record
  Target -> Target to Retrieve
**/
method.retrieveRecord = function(target, cb){
  var _this = this;

  // Check Cache First
  _super.retrieveRecord.apply(this,[target,function(err,record){
    if (!err && record == undefined){

      // Format ETCD Directory String
      var etcd_url = _this.formatETCDKey(target);

      // Search ETCD
      _this.etcd.get(etcd_url, _this.etcd_req_opts, function(err, res){

          // Handle etcd result
          if (err && err.errorCode == 100){
            cb(null,null);
          }
          else if (!err){
            var data;
            try{
              data = JSON.parse(res.node.value);
              data.target = target;
            }
            catch (SyntaxError){
              TuxLab.log('warn', 'Malformed ETCD Record.');
              cb(new Error("Malformed ETCD Record."), null);
            }
            cb(null, data);
          }
          else{
            cb(err,res);
          }

      });
    }
    else {
      cb(err, record);
    }
  }]);
}


module.exports = ETCDBackend;

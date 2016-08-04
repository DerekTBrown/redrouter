/**
  Creates an HTTP Connection Object based on an HTTP/S Request
**/

// Imports
var _ = require('underscore');
var httpUtils = require('./util.js');

/**
  Creates a Resolver
**/
var _super = require('redrouter').resolver.prototype;
var method = HTTPResolver.prototype = Object.create( _super );
    method.constructor = HTTPResolver;


function HTTPResolver(redrouter, opts){
   var _this = this;
   _super.constructor.apply(this, arguments);

  // Save Redrouter instance
  this.backend = redrouter.backend;

  // Create Options Object
  this.opts = {
    redirect_https: (opts.redirect_https !== false) // SHOULD REDIRECT ALL TO HTTPS
  }

  /**
    Helpers
  **/

  /*
   * findTargetRecord
   * Retrieves the matching Host Record from the Backend
   */
   _this.findTargetRecord = function(host, callback){
    _this.backend.retrieveRecord("HTTP::"+host, function(err, res){
      if(err){
        this.log('warn', err);
        callback(null);
      }
      else{
        callback(res);
      }
    });
  };

  /*
   * getMatchingRoute
   * given a target and an array of route objects, determine which
   * route best matches the target
   */
  _this.getMatchingRoute = function(target, routes){
      var target_params = httpUtils.parseURLParams(target);

      // Determine which route matches the best
      return _.max(routes, function(route){
        var route_params = httpUtils.parseURLParams(route.url);

        // Compute number of matching params
        var score = 0;
        for(var i = 0; i < route_params.length; i++){
          if(route_params[i] === target_params[i]){
            score++;
          }
          else{
            break;
          }
        }

        return (score > 0) ? score : null;
      });
  }

  return this;
}

/**
  RESOLVE METHOD

  req -> request information
  opts -> global resolver Options
  callback -> call with null if not resolved
              call with route if resolved
**/
method.resolve = function(request, opts, callback){
  var _this = this;

  // Get Data
  var req = request.data;

  // Parse Request
  if ((request.resolver == "http" || request.resolver == "https") && req.headers.host){

    // Get Request Location
    var host_string = httpUtils.getSource(req);
    var url_string = req.url;

    // Get Host Record
    _this.findTargetRecord(host_string, function(record){
      if(!record){
        callback(null);
      }
      else if (!record.routes || !_.isArray(record.routes) || record.routes.length <= 0){
        callback(record);
      }
      else{

        // Find Best URL Route
        var res = _this.getMatchingRoute(url_string, record.routes);

        // If not URL Matches, use default route.
        if(res === undefined || res === null || res === false){
          res = record;
        }

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

module.exports = HTTPResolver;

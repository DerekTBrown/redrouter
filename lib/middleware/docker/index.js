/**
  Docker Middleware component for RedRouter
**/

// Imports
var _ = require('lodash');
var Dockerode = require('dockerode');

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

  // Start Dockerode Istance
  this.dockerode = new Dockerode(opts.docker_args);

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

  // Check if Docker Record
  if (typeof record.docker_container !== "undefined" && typeof record.host === "undefined"){

    // Look for Container
    return new Promise((resolve, reject) => {
      var container = this.dockerode.getContainer(record.docker_container);
      if(_.isNull((container) || _.isUndefined(container)){
        reject();
      } else {
        resolve(container)
      }
    })

    // Inspect to find IP
    .then((container) => {
      return container.inspect();
    })

    // Set Host Record
    .then((container_inspect) => {
      if(_.has(container_inspect, "NetworkSettings.IPAddress")){
        resolve(container_inspect.NetworkSettings.IPAddress);
      } else {
        reject();
      }
    })

    // Return Results
    .then((record) => {
      callback(null, record);
    })

    // Catch Errors
    .catch((err) => {
      if(!_.isNull(err)){
        _this.log('warn', err);
      }
      callback(err, null)
    })

}
/**
  Destroy Method
**/
method.destroy = function(){

}

module.exports = Docker;

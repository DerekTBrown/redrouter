/**
  SSH Server-Agent for RedRouter
**/

// Imports
var ssh2 = require('ssh2');
var fs = require('fs');

// Create Super Object
var _super = require('redrouter').agent.prototype;
var method = SSHAgent.prototype = Object.create( _super );
    method.constructor = SSHAgent;

/**
   SSH Server Agent Constructor
**/
function SSHAgent(redrouter, options){
  var _this = this;

  var defaults = options.defaults || {};
  this.log = redrouter.log;

  // Handle Incoming Connections
  this.connections = [];
  this.ssh_server = new ssh2.Server({
    hostKeys: [redrouter.ssl.key]
  }, function(client) {

     var route = {};
     var server;

     client.on('authentication', function(ctx) {

       // Request Data
       var req = {
         resolver : "ssh",
         data : ctx
       }

       // Resolve Route
       redrouter.resolve(req, function(record){
         console.log(record);
         if(!record){
           redrouter.log("trace","No Matching Record Found for "+req.data.username);
           ctx.reject();
         }
         else if (typeof record.allowed_auth !== "undefined" && !record.allowed_auth.includes(ctx.method)){
           redrouter.log("trace","AuthType not allowed "+ctx.method);
           ctx.reject();
         }
         else{

           // Merge Records
           route = {
             host: (record.host || defaults.host),
             username: record.username || (ctx.username || defaults.username),
             port : record.port || ( defaults.port || 22),
             password: record.password || (ctx.password || defaults.password),
             privateKey: record.privateKey || (ctx.privateKey || defaults.privateKey)
           }

           // Errors
           if (typeof route.host === "undefined"){
             redrouter.log("warn","Host cannot be undefined.");
           }

           // Start Client
           SSHClient(route,function(s){
             s.end();
             ctx.accept();
           },function(s){
             s.end();
             ctx.reject();
           });

         }
       });

     }).on('error', function(err){
       redrouter.log("warn",err);

     }).on('ready',function(){

       // User Requests a new Session
       client.on('session', function(accept, reject){
         var session = accept();

         // User Requests a PTY
         session.on('pty', function(accept, reject, info){
           var channel = accept();
         });

         // User Alerts to Window Change
         session.on('window-change', function(accept, reject, info){
           var channel = accept();
         });

         // User Requests Shell
         session.on('shell', function(accept, reject){
           SSHClient(route, function(s){
             var channel = accept();

             s.shell(function(err, stream){

               if(err){
                 redrouter.log("warn",err);
               }
               else{
                  redrouter.log("info","user "+route.username+" connected.")
                  stream.pipe(channel).pipe(stream);
               }

             });

           }, function(s,err){
             redrouter.log('warn',err);
             s.close();
           });
         });

       }).on('error',function(err){
         redrouter.log('warn',err);
       });

    }).on('end', function() {
      if(typeof server !== "undefined" ){
        server.end();
      }
    });

  }).listen(options.port, options.host, function() {
      redrouter.log('info','Listening for SSH Requests on port ' + this.address().port);
  });

  /* Server Destroy Behavior */
  this.ssh_server.on('close', function(){
    connections.forEach(function(connection){
      connection.end();
    });
  });

}

/**
  Connection Method
**/
var SSHClient = function(opts, accept, reject){
  server = new ssh2.Client();
  server.on('ready', function(){
    accept(server);
  }).on('error', function(err){
    reject(server, err);
  }).connect(opts);
}

/**
  Destroys the SSHServer
**/
method.destroy = function(){
  this.ssh_server.close();
  _super.destroy.apply(this);
}



module.exports = SSHAgent;

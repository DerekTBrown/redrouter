/**
  Accepts incoming Socket.IO Requests and pipes them into an SSH Client
**/

// Imports
var ssh2 = require('ssh2');

// Create Super Object
var _super = require('redrouter').agent.prototype;
var method = WettyAgent.prototype = Object.create( _super );
    method.constructor = WettyAgent;

/**
  Wetty Server Agent Constructor
**/
function WettyAgent(redrouter, opts){
    var _this = this;
        _this.log = redrouter.log;

    var opts = {
      port: opts.port,
      socket_path : opts.socket_path || '/wetty/socket.io/', // Must both start and end with /
      https_enabled: opts.https_enabled || false
    }

    // Construct Server
    if(opts.https_enabled){
      var httpserv = redrouter.getHTTP(opts.port);
    }
    else{
      var httpserv = redrouter.getHTTPS(opts.port);
    }

    // Start SocketIO
    var io = require('socket.io')(httpserv, { path : opts.socket_path });
        io.on('connection', function(socket){

            // Server Object
            var server;

            // Set Terminal Settings
            var pty = {
              rows: 24,
              cols: 80,
              height: 480,
              width: 640,
              term: 'xterm-256color'
            }
            socket.once('resize', function(data){
              pty.rows = data.rows,
              pty.cols = data.cols,
              pty.height = data.height,
              pty.width = data.width
            });

            // Destroy Function
            var destroyed = false;
            var destroyConnection = function(){
              if(!destroyed){
                if (typeof server !== "undefined"){
                  server.end();
                }
                socket.disconnect();
                redrouter.log('info',route.username + " disconnected.");
              }
              destroy = true;
            }

            // Request Data
            var req = {
              resolver : "ssh-ws",
              data : socket.request
            }

            // Resolve Request
            redrouter.resolve(req, function(record){
              if(!record){
                socket.emit('exception', {errorMessage: '404 : Proxy Record Not Found'});
              }
              else{

                // Merge Records
                route = {
                  host:  record.host,
                  username: record.username || socket.request._query['username'],
                  port : record.port || 22,
                  password: socket.request._query['password'] || record.password,
                  privateKey: record.privateKey
                }

                // Allow Keyboard Auth
                if (!opts.disable_keyboard)
                  route.tryKeyboard = true;

                // Log
                redrouter.log("info",route.username + " connected.");

                // Errors
                if (typeof route.host === "undefined"){
                  redrouter.log("warn","Host cannot be undefined.");
                }

                // Start Client
                    server = new ssh2.Client();
                    server.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish){

                       // TEST
                       console.log("Keyboard Interactive");

                       // Output overall instructions
                       socket.emit('output', instructions);

                       // Responses
                       var exp_prompt_length = prompts.length;
                       var responses = [];

                       // Continuation through Prompts
                       var interactivePrompt = function(){

                           // Handle Prompts Response
                           socket.once('input', function(data){
                              responses.push(data);

                              if(prompts.length > 0){
                                interactivePrompt();
                              }
                           });

                           // Send Prompts
                           socket.emit('prompt', prompts.shift());
                       }

                       // Return Responses
                       if (responses.length == exp_prompt_length){
                         finish(responses);
                       }
                       else{
                         redrouter.log("warn","incorrect number of responses");
                         destroyConnection();
                       }

                    }).on('ready', function(){

                       server.shell(pty, undefined, function(err, output){
                          // Handle Errors
                          if (err){
                            redrouter.log('warn',err);
                            destroyConnection();
                          }

                          else{

                            // Handle Server Output
                            output.on('data', function(data){
                              socket.emit('output', data.toString());
                            });

                            // Handle Server-side Close
                            output.on('close', function(){
                              destroyConnection();
                            })

                            // Handle User Input
                            socket.on('input', function(data){
                              output.write(data);
                            })

                            // Resize Event
                            socket.on('resize', function(data){
                                output.setWindow(data.rows, data.cols, data.height, data.width);
                            });

                          }
                       });
                    }).on('error', function(err){
                      socket.emit('exception', err);
                      redrouter.log('warn', err);
                    }).on('end', function(){
                      destroyConnection();
                    }).connect(route);

                // Handle Disconnect
                socket.on('disconnect', destroyConnection);
              }
            });
        });

}

// Export
module.exports = WettyAgent;

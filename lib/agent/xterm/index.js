/**
  Accepts incoming Socket.IO Requests and pipes them into an SSH Client
**/

// Imports
var _ = require('lodash');
var ssh2 = require('ssh2');

// Create Super Object
var _super = require('redrouter').agent.prototype;
var method = XTermAgent.prototype = Object.create( _super );
    method.constructor = XTermAgent;

/**
  Wetty Server Agent Constructor
**/
function XTermAgent(redrouter, opts){
    var _this = this;
        _this.log = redrouter.log;

    var opts = _.defaults(opts, {
      socket_path : '/xterm/socket.io/', // Must both start and end with /
      https_enabled: false
    });

    // Construct Server
    if(!opts.https_enabled){
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
            var destroyConnection = function(){
              if (typeof server !== "undefined"){
                server.end();
              }
              socket.disconnect();
              redrouter.log('info',route.username + " disconnected.");
            }

            // Request Data
            var req = {
              resolver : "ssh-ws",
              data : socket.request
            }

            // Resolve Request
            redrouter.resolve(req, function(record){
              if(!record) {
                socket.emit('exception', {message : '404 : Proxy Record Not Found'});
              }

              else {

                // Merge Records
                route = {
                  host:  record.host,
                  username: record.username || socket.request._query['username'],
                  port : record.port || 22,
                  password: socket.request._query['password'] || record.password,
                  privateKey: record.privateKey
                }

                // Allow Keyboard Auth
                if (!opts.disable_keyboard){
                  route.tryKeyboard = true;
                }

                // Log
                redrouter.log("info",route.username + " connected.");

                // Errors
                if (typeof route.host === "undefined"){
                  redrouter.log("warn","Host cannot be undefined.");
                }

                // Start Client
                    server = new ssh2.Client();
                    server.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish){

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
                           socket.emit('output', prompts.shift());
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
                                console.log("Resized!");
                                output.resize(data.rows, data.cols);
                            });
                          }
                       });

                    }).on('error', function(err){
                      socket.emit('error', err);
                      redrouter.log('warn', err);

                    }).on('end', function(){
                      destroyConnection();
                    }).connect(route);

                // Handle Disconnect
                socket.on('disconnect', destroyConnection);
              }
            });

            socket.on('error', function(err){
              redrouter.log('warn', err);

              return null;
            });
        });

}

// Export
module.exports = XTermAgent;

/**
  HTTP/S Agent for Red Router
**/

// Imports
var httpProxy = require('http-proxy');
var httpUtils = require('./util.js');

// Create Super Object
var _super = require('redrouter').agent.prototype;
var method = HTTPAgent.prototype = Object.create( _super );
    method.constructor = WettyAgent;

/**
  HTTP Server Agent Constructor
**/
function HTTPAgent(redrouter, opts){
  var _this = this;
      _this.log = redrouter.log;

  var opts = this.opts = {
    port: opts.port,
    https_enabled: opts.https_enabled || false,

    // HEADERS
    ntlm: (opts.ntlm != false), // NTLM HEADERS
    xfwd: (opts.xfwd != false), // ADD X-FORWARD HEADER

    // SSL OPTIONS
    secure: (opts.secure !== false), // VERIFY SSL CERTS
  }

  /*
   * Create Proxy Server
   */
   this.proxy = httpProxy.createProxyServer({
     xfwd: opts.xfwd,
     prependPath: false,
     secure: (opts.secure !== false)
   });

   proxy.on('proxyReq', function(p, req){
     if(req.host != null){
       p.setHeader('host', req.host);
     }
   });

   /*
    * NTLM Support
    */
    if(opts.ntlm){
     proxy.on('proxyRes', function (proxyRes) {
       var key = 'www-authenticate';
       proxyRes.headers[key] = proxyRes.headers[key] && proxyRes.headers[key].split(',');
     });
   }

   /*
    * onHTTPRequest()
    * Handles incoming HTTP/S Requests
    */
    var onHTTPRequest = function(request, response){

      // Create HTTP Request Header
      var req = {
        resolver: request.protocol,
        data: request
      }

      // Resolve HTTP Request
      redrouter.resolve(req, function(record){
          if(!record){
            httpUtils.respondNotFound(request, response);
          }
          else{

            // Get Source
            var source = httpUtils.getSource(request);

            // Should Redirect to HTTPS
            if ( !request.secure && record.redirect_https ){
                respondToHttps(request, response);
            } else {
                _this.proxy.web(request, response, {target: record.host});
            }

          }
      });
    }

    /*
     * onHTTPUpgradeRequest()
     * handles requests for WebSockets
     */
     var onHTTPUpgradeRequest = function(request, socket, head){
       var source = httpUtils.getSource(req);

       // Create WebSocket Request
       var req = {
         resolver: request.protocol,
         data: request
       }

       // Resole HTTP Request
     }

    /*
     * onHTTPServerError()
     * Handles Server Errors
     */
     var onHTTPServerError = function(err){
       _this.log(err);
     }

     /*
      * onHTTPClientError()
      * Handles client errors (HTTPS Client)
      */
      var onHTTPClientError = function(err){
        _this.log(err);
      }

    // Start HTTP Proxy Server
     _this.HTTPServer = redrouter.getHTTP(opts.port);
     _this.HTTPServer.on('request',onHTTPRequest);

     // Error Logging
     _this.HTTPServer.on('error', onHTTPServerError);

    // Start HTTPS Proxy SErver
     if (opts.https_enabled){
     _this.HTTPSServer = redrouter.getHTTPS(opts.port);
     _this.HTTPSServer.on('request',onHTTPRequest);

     // Error Logging
     _this.HTTPSServer.on('error', onHTTPServerError);
     _this.HTTPSServer.on('clientError', onHTTPClientError);
    }

}

module.exports = HTTPAgent;

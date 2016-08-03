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

  var opts = {
    port: opts.port,
    https_enabled: opts.https_enabled || false,

    // HEADERS
    ntlm: (opts.ntlm != false), // NTLM HEADERS
    xfwd: (opts.xfwd != false), // ADD X-FORWARD HEADER

    // SSL OPTIONS
    secure: (opts.secure !== false), // VERIFY SSL CERTS
    redirect_https: (opts.redirect_https !== false) // SHOULD REDIRECT TO HTTPS
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
    * HTTP Proxy Server
    */
    var HTTPServer = redrouter.getHTTP(opts.port);
        HTTPServer.on('request', function(request, response){

            // Create HTTP Request Header
            var req = {
              resolver: "http",
              data: request
            }

            // Resolve HTTP Request
            redrouter.resolve(request, function(record){
                if(!record){
                  httpUtils.respondNotFound(request, response);
                }
                else{

                  // Get Source
                  var source = httpUtils.getSource(request);

                  // Should Redirect to HTTPS
                  if ( opts.redirect_https || record.redirect_https ){
                      respondToHttps(request, response);
                  } else {
                      _this.proxy.web(request, response, {target: record.host});
                  }

                }
            });
        });


    /*
     * HTTPS Proxy Server
     */
     var HTTPSServer = redrouter.getHTTPS(opts.port);
         HTTPSServer.on('request', function(request, response){

              // Create HTTPS Request Header
              var req = {
                resolver: "https",
                data: request
              }

              // Resolve HTTPS Request
              redrouter.resolve(req, function(record){
                if(!record){
                  httpUtils.respondNotFound(request, response);
                } else {

                }
              });


         });

}

module.exports = HTTPAgent;

/**
  SSH Proxy over WebSockets
**/

// Import RedRouter Core
var redrouter = require('../../').create;

// Import RedRouter Components
var backend_static = require('redrouter.backend.static');
var agent_xterm = require('redrouter.agent.xterm');
var resolver_ssh = require('redrouter.resolver.ssh');

/*
  Define a RedRouter Instance
*/
var proxy = new redrouter({
  backend : {
    constructor: backend_static,
    options: {
      records : {
        "SSH::example" : {
          host : "host",
          port: 22,
          username: "actual_username",
          allowed_auth: ["password"]
        }
      }
    }
  },
  resolvers: [
    { constructor: resolver_ssh,
      options: {

      }
    }
  ],
  agents: [
    { constructor: agent_xterm,
      options: {
        port : 3000
      }
    }
  ]
});

/**
  SSH Tunnel Example using RedRouter
**/

// FS for Keys
var fs = require('fs');

// Import RedRouter Core
var redrouter = require('../../').create;

// Import RedRouter Components
var backend_etcd = require('redrouter.backend.etcd');
var agent_ssh = require('redrouter.agent.ssh-proxy');
var resolver_ssh = require('redrouter.resolver.ssh');

/*
  Define a RedRouter Instance
*/
var proxy = new redrouter({
  ssl : {
    key : fs.readFileSync('examples/ssh/example.key')
  },
  backend : {
    constructor: backend_etcd,
    options: {
      host: "localhost:2379",
      etcd_conn_opts: {}
    }
  },
  resolvers: [
    { constructor: resolver_ssh,
      options: {
        defaults: {
          allowed_auth: ['password']
        }
      }
    }
  ],
  agents: [
    { constructor: agent_ssh,
      options: {
        host: 'localhost',
        port: 3000
      }
    }
  ]
});

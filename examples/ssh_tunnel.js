/**
  SSH Tunnel Example using RedRouter
**/

// Import RedRouter Core
var redrouter = require('../');

// Import RedRouter Components
var backend_etcd = require('../lib/backend/etcd');
var agent_ssh = require('../lib/agent/ssh');
var resolver_ssh_username = require('../lib/resolver/ssh_username.js');

/*
  Define a RedRouter Instance
*/
var proxy = new redrouter({
  backend : {
    constructor: backend_etcd,
    options: {
      host: "localhost:2379",
      etcd_conn_opts: {}
    }
  },
  resolvers: [
    { constructor: resolver_ssh_username, options: {}}
  ],
  agents: [
    { constructor: agent_ssh, options: { host: 'localhost', port: 3000}}
  ]
});

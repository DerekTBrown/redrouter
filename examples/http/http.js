/**
  Example HTTP Proxy in RedRouter
**/

// Import RedRouter Core
var redrouter = require('../../').create;

// Import RedRouter Components
var backend_etcd = require('redrouter.backend.etcd');
var agent_http = require('redrouter.agent.http-proxy');
var resolver_http = require('redrouter.resolver.http');

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
    {
      constructor: resolver_http
    }
  ],
  agents: [
    { constructor: agent_http,
      options: {
        host: 'localhost',
        port: 3000
      }
    }
  ]
});

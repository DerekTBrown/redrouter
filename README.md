# RedRouter

[![Build Status](https://travis-ci.org/DerekTBrown/redrouter.svg?branch=master)](https://travis-ci.org/DerekTBrown/redrouter)
[![npm version](https://badge.fury.io/js/redrouter.svg)](https://badge.fury.io/js/redrouter)

**RedRouter is a universal reverse-proxy developed in Node.JS.  It is designed to be modular as possible, allowing you to use whatever Backend, Resolver and Proxy Agent you wish.   What are these things, you ask?**

## Design
#### Backend
Backends are used to store the proxy records themselves.  By default, RedRouter stores proxy records in a memory cache, but you can additionally choose to search the following:
- [X] memory
- [X] etcd
- [ ] memcached
- [ ] mongodb
- [ ] mysql
- [ ] redis
- [ ] consul

once a record has been found, it is added to the local memory cache, to reduce the time for subsequent requests.

#### Resolvers
Resolvers are used to find the proxy record matching a particular request.  This could be as simple as checking against the HTTP Request URL or SSH Username, or could be more complex, such as pattern matching. Some that have been implemented:
- [X] HTTP / HTTPS
- [X] SSH (Username)

#### Middleware
Your application can optionally implement a middleware stack, used to transform the content of proxy records.   This could be anything- logging, load balancing, even Docker discovery.  As with other middleware stacks, order does matter- so be sure to document this in developing your middleware.
- [X] docker resolution
- [ ] round robin
- [ ] dynamic load balancing

#### Proxy Agent
Proxy agents forward the content to a destination given the route provided by
the resolver.  Some that have been implemented:
- [X] HTTP
- [X] HTTPS
- [ ] TCP
- [X] SSH (Requires SSH Resolver)
- [X] SSH over WebSockets (Basic wrapper used by Wetty)

#### Usecases
We are in the process of writing some simple example usecases in the `./examples` folder.  Feel free to contribute your own example code.  Some of the uses we have thought of:
- HTTP Proxy for Docker Containers
- SSH Proxy
- SSH over WebSockets


## Getting Started

#### Examples

#### Encryption
If you wish to use encryption (for HTTPS, etc), you can pass options into the SSL object:
```
ssl: {
  key : fs.readFileSync('/root/local/host.key'),
  cert : fs.readFileSync('/root/local/host.cert')
}
```

#### Logging
RedRouter uses [Winston](https://github.com/winstonjs/winston) logging throughout.


## API

## Contributing
> RedRouter began by merging code from the [RedBird](https://github.com/OptimalBits/redbird) and [RedWire](https://github.com/metocean/redwire) projects.  Thanks to them for their incredible contribuitions!

Because of its modularity, contributing to the RedRouter project is easy.  Simply make a feature request in the issues, so that we can discuss any details, and you can ask any questions that arise.  Right now, packages in the /agent, /backend, /middleware and /resolver folders will all be included in the core module- but to reduce the number of dependencies in the future, these will be moved to separate repositories.

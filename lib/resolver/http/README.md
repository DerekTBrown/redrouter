## RedRouter HTTP Resolver
The HTTP Resolver, intended for use with the HTTP Agent, routes HTTP and HTTPS
requests.  The route records can be created by prefixing the `HTTP::` string to
the route,  For example, if I wanted to create an HTTP proxy for "example.org":

```
key: HTTP::example.org
value:
{
  host: "10.100.1.10"
}
```

If I would like to proxy certain paths, I can add these to the routes object.  For example,
"example.org/animals" would route to 10.100.1.11, but "example.org/animals/bear" would route to 10.100.1.12, but any other path inside of example.org would route to 10.100.1.10:

```
key: HTTP::example.org
value:
{
  host: "10.100.1.10",
  routes: [
    {
      url : "animals"
      host: "10.100.1.11"
    },
    {
      url : "animals/bear"
      host: "10.100.1.12"
    }
  ]
}
```

If you dont wish to supply all of these fields, you can establish defaults by passing the same keys into the resolver_ssh options when you create the RedRouter object:

```
resolvers: [
  { constructor: resolver_http,
    options: {
      defaults: {
        redirect_https : true
      }
    }
  }
],
```

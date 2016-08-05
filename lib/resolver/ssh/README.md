### SSH Resolver for RedRouter
The SSH Resolver is used to route incoming requests based on username. The route records for use with SSH are prefixed by the SSH:: protocol string.  For example, if I wanted to route the SSH user DerekTBrown, I can create a key "SSH::DerekTBrown" with the following information:

```
{
  host : "allderek.com",
  port: 22,
  username: "derekbro", // This would override the username used by the user at login
  password: "password", // If unset, the password is interactively ascertained,
  allowed_auth: ["password"] // Methods to attempt for authentication.
}
```

If you dont wish to supply all of these fields, you can establish defaults by passing the same keys into the resolver_ssh options when you create the RedRouter object:

```
resolvers: [
  { constructor: resolver_ssh,
    options: {
      defaults: {
        allowed_auth: ['password']
      }
    }
  }
],
```

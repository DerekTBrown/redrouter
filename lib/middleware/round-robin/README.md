## Round-Robin Routing for RedRouter

Performs basic Red-Robin routing by converting the "hosts" array into a single "host" array, regardless of type.  Be sure that the Red-Robin router is before any middleware which affects the host property, such as Docker.

For example:
```
{
  hosts: ["10.100.1.10", "10.100.1.11"]
}
```
becomes:
```
{
  host: ["10.100.1.10"]
}
```

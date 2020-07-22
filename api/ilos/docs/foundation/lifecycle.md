---
title: Lifecycle
lang: en-US
footer: Apache 2.0 Licensed
---
# Lifecyle
## Start
```
[Kernel]
  | bootstrap
    |
    [Service provider]
      | register
      | init
[Transport]
  | up
```

## Stop
```
[Kernel]
  | shutdown
    |
    [Service provider]
      | destroy
[Transport]
  | down
```
# Hooks
## Kernel level
### Bootstrap
Bootstrap hook is used in the kernel to initiate register and init hook in service providers.

### Shutdown
Shutdown hook is used in the kernel to destroy services providers and close the app.

## Service provider and provider level

### Register
Register hook is used to declare bindings.

### Init
Init hook is called just after register to initialize service providers or providers.

### Destroy
Destroy hook is called just before the service provider is destroyed.

## Transport level
### Up 

### Down

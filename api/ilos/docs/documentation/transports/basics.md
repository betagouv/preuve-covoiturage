---
title: Basics
lang: en-US
footer: Apache 2.0 Licensed
---

# Transport
## What is a transport ?
A transport is a class which implements `TransportInterface`. It consume the kernel to access to handlers.

By example, an HTTP transport should start an HTTP server which will use kernel to get response from rpc call.

## How to use it


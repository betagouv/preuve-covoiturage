---
title: Concepts
lang: en-US
footer: Apache 2.0 Licensed
---

The main idea of the framework is to keep thing simple, loosely coupled, customizable and extendable. In order to do so, three main concepts are used: 

## Handler
Handler is the exposed business logic. By example, you may not directly use db but maybe manipulate or expose data. In order to do stuff, you may need some providers.

## Provider
Providers is everything that will be consumed by handler (or other provider). By example, you may have a repository that can access to db.

## ServiceProvider
Service provider is a configuration for resolving provider, expose handlers, make that works together.

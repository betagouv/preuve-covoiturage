---
title: Template
lang: en-US
footer: Apache 2.0 Licensed
---

# Template provider
The template provider aims to provide simple templating with [handlebars](https://handlebarsjs.com/).

## Installation
`yarn add @ilos/template`

## Configuration

### Register to provider in service provider
```ts 
@Container.serviceProvider({
  template: {
    path: '/path/to/template',
    meta: 'config.templateMeta',
  }
})
```
Use the `template` keyword to load template provider. This keywords may receive an object as: 
- path: path string to the template directory ;
- meta: either a config key or a object as `{ [k:string]: any }`;

### Define templates in directory

```
services
│
└───greeting
    |
    └───src
        |
        └───templates
        │   │   
        │   └─── invite.hbs 
        ...
```

## Usage
In order get config provider from IOC, you must add it in the constructor. 

```ts
    constructor(
        protected template: TemplateInterfaceResolver,
    ) {}
    ... 
    
    const templateData = { fullname };
    const templateFileName = 'invite';
    
    const content = this.template.get(templateFileName, templateData);
```

The variable 'content' has the compile template 'invite' with the variables replaced defined in 'templateData'.

## Pattern

Templates are used in the [notification provider](/documentation/providers/notification)

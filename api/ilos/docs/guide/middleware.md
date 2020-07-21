## Middleware example with full provider implementation 

Other example of dumb auth package implementing a custom middleware

### File structure 

+ **auth : Example de provider**
    - **src**
        - **middlewares**
            - AuthMiddleware.ts
        - index.ts
    - package.json
    - tsconfig.json

**package.json**
```json
{
  "name": "@my-app/provider-auth",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "typings": "dist/index.d.js",
  "license": "Apache-2.0",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",  
    "lint": "eslint 'src/**/*.ts'"
  },
  "dependencies": {
  },
  "devDependencies": {
    "ts-node": "^8.6.2",
    "typescript": "^3.7.5"
  }
}
```

**tsconfig.js**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**index.ts**
```ts
// all exposed features
export { AuthMiddleware } from "./middlewares/AuthMiddleware";
```

**AuthMiddleware.ts**
```ts
import {
  middleware,
  MiddlewareInterface,
  ForbiddenException,
  ParamsType,
  ContextType,
  ResultType
} from "@ilos/common";

/*
 * Use middleware decorator to expose the middleware
 */
@middleware()
export class AuthMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,         // params send from request
    context: ContextType,       // context can be populated from other middlewares
    next: Function,             // next callback
    config: string[]            // send from config (see service provider)
  ): Promise<ResultType> {

    // Before request check with a dumb password from params
    if (!params || params.token !== "mysecretoken") {
        // send forbidden if it fails
        throw new ForbiddenException("No ouay");
    }

    // pass to next middleware
    const result = await next();

    // After request is executed add some context data 
    return { ...result, token: params.token };
  }
}
```
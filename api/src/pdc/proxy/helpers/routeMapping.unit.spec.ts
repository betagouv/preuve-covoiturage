import {
  assertEquals,
  assertObjectMatch,
  beforeAll,
  describe,
  it,
  supertest,
} from "@/dev_deps.ts";
import {
  RPCSingleCallType,
  RPCSingleResponseType,
} from "@/ilos/common/index.ts";
import { Kernel as AbstractKernel } from "@/ilos/core/index.ts";

import { bodyParser, express, expressSession } from "@/deps.ts";
import { routeMapping } from "./routeMapping.ts";

describe.skip("routeMapping", () => {
  class Kernel extends AbstractKernel {
    async handle(call: RPCSingleCallType): Promise<RPCSingleResponseType> {
      return {
        jsonrpc: "2.0",
        id: call.id || "",
        result: {
          method: call.method,
          ...call.params,
        },
      };
    }
  }
  const app = express();
  const fakeUser = {
    id: "1",
    firstName: "Nicolas",
    lastname: "Test",
  };
  const responseFactory = (method: string, params: any): any => {
    return {
      method,
      params,
      _context: {
        call: {
          user: fakeUser,
        },
        channel: {
          service: "proxy",
          transport: "node:http",
        },
      },
    };
  };
  const kernel = new Kernel();
  const routeMap: any = [
    {
      verb: "post",
      route: "/user/:id",
      signature: "user:update",
      mapRequest(body: any, query: any, params: any): any {
        return {
          ...body,
          id: params.id,
        };
      },
    },
    {
      verb: "get",
      route: "/user/:id",
      signature: "user:read",
      mapResponse(response: any): any {
        return {
          ...response,
          params: fakeUser,
        };
      },
    },
    ["post", "/user", "user:create"],
    {
      verb: "get",
      route: "/user",
      signature: "user:list",
      mapRequest(body: any, query: any): any {
        return {
          ...body,
          ...query,
        };
      },
    },
  ];

  app.use(bodyParser.json({ limit: "2mb" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(
    expressSession({
      secret: "SECRET",
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use((req: any, res: any, next: any) => {
    req.session.user = fakeUser;
    next();
  });

  routeMapping(routeMap, app, kernel);
  let request: any;
  beforeAll(async () => {
    request = supertest(app);
  });

  it("[Route mapping] works", async () => {
    const response = await request
      .post("/user")
      .send({
        firstName: "John",
        lastname: "Doe",
      })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    assertEquals(response.status, 200);
    assertObjectMatch(
      response.body,
      responseFactory("user:create", {
        firstName: "John",
        lastname: "Doe",
      }),
    );
  });

  it("[Route mapping] works with url params", async () => {
    const response = await request
      .post("/user/1")
      .send({
        firstName: "John",
        lastname: "Doe",
      })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    assertEquals(response.status, 200);
    assertObjectMatch(
      response.body,
      responseFactory("user:update", {
        id: "1",
        firstName: "John",
        lastname: "Doe",
      }),
    );
  });

  it("[Route mapping] works with query params", async () => {
    const response = await request
      .get("/user/?orderBy=date")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    assertEquals(response.status, 200);
    assertObjectMatch(
      response.body,
      responseFactory("user:list", {
        orderBy: "date",
      }),
    );
  });

  it("[Route mapping] works with response mapping", async () => {
    const response = await request
      .get("/user/1")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    assertEquals(response.status, 200);
    assertObjectMatch(
      response.body,
      responseFactory("user:read", {
        ...fakeUser,
      }),
    );
  });
});

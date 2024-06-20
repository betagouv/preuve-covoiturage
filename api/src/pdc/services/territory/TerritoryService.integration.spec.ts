import {
  afterAll,
  assert,
  assertEquals,
  assertObjectMatch,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import {
  HttpContext,
  makeHttpBeforeAfter,
} from "@/pdc/providers/test/index.ts";

import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { ServiceProvider } from "./ServiceProvider.ts";

describe.skip("TerritoryService", () => {
  let ctx: HttpContext;

  const name = "Toto";
  const territoryGroupTable = "territory.territory_group";
  const territorySelectorTable = "territory.territory_group_selector";

  function getDb(): PostgresConnection {
    return ctx.transport.getKernel().getContainer().get(ServiceProvider)
      .getContainer().get(PostgresConnection);
  }

  const { before, after } = makeHttpBeforeAfter(ServiceProvider);

  beforeAll(async () => {
    ctx = await before();
  });

  afterAll(async () => {
    for (
      const text of [
        `DELETE FROM ${territorySelectorTable} WHERE territory_group_id IN 
      (SELECT _id FROM ${territoryGroupTable} WHERE name = $1)`,
        `DELETE FROM ${territoryGroupTable} WHERE name = $1`,
      ]
    ) {
      await getDb()
        .getClient()
        .query({
          text,
          values: [name],
        });
    }
    await after(ctx);
  });

  it("Create a territory", async () => {
    const response = await ctx.request(
      "territory:create",
      {
        name,
        shortname: "toto",
        company_id: 1,
        contacts: {},
        address: {
          street: "1500 BD LEPIC",
          postcode: "73100",
          city: "Aix Les Bains",
          country: "France",
        },
        selector: {
          com: ["91477", "91471"],
        },
      },
      {
        call: {
          user: {
            permissions: ["registry.territory.create"],
          },
        },
      },
    );
    assertEquals(response.result.name, name);

    const dbResult = await getDb()
      .getClient()
      .query({
        text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
        values: [name],
      });

    assert((dbResult.rowCount || 0) >= 1);
    assertEquals(dbResult.rows[0].name, name);
  });

  it("Find a territory", async () => {
    const dbResult = await getDb()
      .getClient()
      .query({
        text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
        values: [name],
      });

    assert((dbResult.rowCount || 0) >= 1);
    assertEquals(dbResult.rows[0].name, name);
    const _id = dbResult.rows[0]._id;

    const response = await ctx.request(
      "territory:find",
      { _id },
      {
        call: {
          user: {
            permissions: ["common.territory.find"],
          },
        },
      },
    );
    assertEquals(response.result.name, "Toto");
  });

  it("Update a territory", async () => {
    const dbResult = await getDb()
      .getClient()
      .query({
        text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
        values: [name],
      });

    assert((dbResult.rowCount || 0) >= 1);
    assertEquals(dbResult.rows[0].name, name);
    const _id = dbResult.rows[0]._id;

    const initResponse = await ctx.request(
      "territory:find",
      { _id },
      {
        call: {
          user: {
            permissions: ["common.territory.find"],
          },
        },
      },
    );
    assertEquals(initResponse.result.name, name);

    const updateData = {
      ...initResponse.result,
      selector: {
        com: ["91471", "91377"],
      },
    };
    const response = await ctx.request("territory:update", updateData, {
      call: {
        user: {
          permissions: ["registry.territory.update"],
        },
      },
    });

    assertEquals(response.result.selector.com.length, 2);

    const finalResponse = await ctx.request(
      "territory:find",
      { _id },
      {
        call: {
          user: {
            permissions: ["common.territory.find"],
          },
        },
      },
    );
    const { updated_at: u1, ...t1 } = finalResponse.result;
    const { updated_at: u2, ...t2 } = updateData;
    assertObjectMatch(t1, t2);
  });

  it("Patch contact on a territory", async () => {
    const dbResult = await getDb()
      .getClient()
      .query({
        text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
        values: [name],
      });
    assert((dbResult.rowCount || 0) >= 1);
    assertEquals(dbResult.rows[0].name, name);
    const _id = dbResult.rows[0]._id;

    const response = await ctx.request(
      "territory:patchContacts",
      {
        _id: _id - 1,
        patch: {
          technical: {
            firstname: "Nicolas",
          },
        },
      },
      {
        call: {
          user: {
            permissions: ["territory.territory.patchContacts"],
            territory_id: _id,
          },
        },
      },
    );
    assertEquals(response.result._id, _id);
    assertEquals(response.result.contacts.technical.firstname, "Nicolas");
  });

  it("Get authorized codes", async () => {
    const dbResult = await getDb()
      .getClient()
      .query({
        text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
        values: [name],
      });
    assert((dbResult.rowCount || 0) >= 1);
    assertEquals(dbResult.rows[0].name, name);
    const _id = dbResult.rows[0]._id;

    await getDb()
      .getClient()
      .query({
        text: `
      INSERT INTO ${territorySelectorTable}
      (territory_group_id, selector_type, selector_value) VALUES
      ($1, $2, $3)
      `,
        values: [_id, "com", "91477"],
      });

    const response = await ctx.request(
      "territory:getAuthorizedCodes",
      {
        _id,
      },
      {
        call: {
          user: {
            permissions: ["common.territory.read"],
          },
        },
      },
    );
    assert(Array.isArray(response.result.com));
    assert(response.result.com.length === 3);
    assertEquals(response.result.com.sort(), ["91377", "91471", "91477"]);
  });

  it("Lists all territories", async () => {
    const response = await ctx.request(
      "territory:list",
      {
        search: name,
      },
      {
        call: {
          user: {
            permissions: ["common.territory.list"],
          },
        },
      },
    );
    assert("data" in response.result);
    assert(Array.isArray(response.result.data));
    const territory = response.result.data.filter((r: any) => r.name === name);
    assertEquals(territory.length, 1);
  });

  it("Lists all geo zones", async () => {
    const response = await ctx.request(
      "territory:listGeo",
      {
        search: "Massy",
      },
      {
        call: {
          user: {
            permissions: ["common.territory.list"],
          },
        },
      },
    );
    assert("data" in response.result);
    assert(Array.isArray(response.result.data));
    assertEquals(response.result.data.length, 1);
    assertEquals(response.result.meta.pagination.total, 1);
    assertEquals(response.result.meta.pagination.offset, 0);
    assertEquals(response.result.meta.pagination.limit, 100);
  });
});

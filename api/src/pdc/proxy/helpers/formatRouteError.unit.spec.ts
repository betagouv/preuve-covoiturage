import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { NotFoundException, UnexpectedException } from "@/ilos/common/index.ts";
import { formatRouteError } from "./formatRouteError.ts";

describe("formatRouteError", () => {
  it("keeps typed 4xx message (plain)", () => {
    const { status, body } = formatRouteError(new NotFoundException("no such thing"), false);
    assertEquals(status, 404);
    assertEquals(body, "no such thing");
  });

  it("keeps typed 4xx rpcError (rpc)", () => {
    const e = new NotFoundException("no such thing");
    const { status, body } = formatRouteError(e, true);
    assertEquals(status, 404);
    assertEquals(body, { jsonrpc: "2.0", id: 1, error: e.rpcError });
  });

  it("masks raw Error as 500 (plain)", () => {
    const { status, body } = formatRouteError(new Error('relation "foo" does not exist'), false);
    assertEquals(status, 500);
    assertEquals(body, { error: "Internal Server Error" });
  });

  it("masks raw Error as 500 (rpc)", () => {
    const { status, body } = formatRouteError(new TypeError("Cannot read properties of undefined"), true);
    assertEquals(status, 500);
    assertEquals(body, {
      jsonrpc: "2.0",
      id: 1,
      error: { code: 500, data: "Error", message: "Internal Server Error" },
    });
  });

  it("masks UnexpectedException (httpCode 500) even with a custom message", () => {
    const { status, body } = formatRouteError(new UnexpectedException("pg: password authentication failed"), true);
    assertEquals(status, 500);
    assertEquals(body, {
      jsonrpc: "2.0",
      id: 1,
      error: { code: 500, data: "Error", message: "Internal Server Error" },
    });
  });

  it("handles non-Error throws", () => {
    const { status, body } = formatRouteError("boom", false);
    assertEquals(status, 500);
    assertEquals(body, { error: "Internal Server Error" });
  });
});

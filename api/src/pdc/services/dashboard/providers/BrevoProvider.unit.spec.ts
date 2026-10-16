import { assertEquals } from "dep:assert";
import { afterEach, describe, it } from "dep:testing-bdd";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { BrevoProvider } from "./BrevoProvider.ts";

function fakeConfig(values: Record<string, unknown>): ConfigInterfaceResolver {
  return { get: (k: string, d?: unknown) => values[k] ?? d } as unknown as ConfigInterfaceResolver;
}

const configured = {
  "brevo.apiUrl": "https://brevo.example.com/smtp/email",
  "brevo.apiKey": "secret",
  "brevo.welcomeTemplateId": 12,
};

describe("BrevoProvider.sendWelcomeEmail", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function stubFetch(status = 200) {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    globalThis.fetch = ((url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return Promise.resolve(new Response("ok", { status }));
    }) as unknown as typeof fetch;
    return calls;
  }

  it("transmet login_url au template Brevo", async () => {
    const calls = stubFetch();
    const provider = new BrevoProvider(fakeConfig(configured));
    await provider.init();

    await provider.sendWelcomeEmail({
      email: "u@example.com",
      siret: "12345678901234",
      login_url: "https://partenaire.example.com",
    });

    assertEquals(calls.length, 1);
    assertEquals(calls[0].url, configured["brevo.apiUrl"]);
    assertEquals(calls[0].body.templateId, 12);
    assertEquals(calls[0].body.params, {
      email: "u@example.com",
      siret: "12345678901234",
      login_url: "https://partenaire.example.com",
    });
  });

  it("n'envoie rien quand la configuration est vide", async () => {
    const calls = stubFetch();
    const provider = new BrevoProvider(fakeConfig({ ...configured, "brevo.apiKey": "" }));
    await provider.init();

    await provider.sendWelcomeEmail({ email: "u@example.com", siret: "", login_url: "https://x" });

    assertEquals(calls.length, 0);
  });
});

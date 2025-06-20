import { UnauthorizedException } from "@/ilos/common/index.ts";
import { CreateCredentialsResult } from "@/pdc/services/auth/dto/Credentials.ts";
import { env } from "./config.ts";
import { faker } from "./faker.ts";
import { RPCResponse } from "./types.ts";

export type HTTPResponse<T = string | object | null> = {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  redirected: boolean;
  headers: Headers;
  body: T;
};

export class API {
  #baseUrl = env("APIE2E_API_URL", "http://localhost:8080");
  #apiVersion = env("APIE2E_API_VERSION", "v3");
  #defaultAccessKey: string;
  #defaultSecretKey: string;
  #accessToken: string | null = null;
  #sessionCookie: string | null = null;

  get token(): string | null {
    return this.#accessToken;
  }

  constructor() {
    this.#defaultAccessKey = env("APIE2E_AUTH_ACCESSKEY");
    this.#defaultSecretKey = env("APIE2E_AUTH_SECRETKEY");
  }

  public async authenticate(access_key?: string, secret_key?: string): Promise<void> {
    access_key = access_key || this.#defaultAccessKey;
    secret_key = secret_key || this.#defaultSecretKey;

    try {
      const url = new URL(`/${this.#apiVersion}/auth/access_token`, this.#baseUrl);

      // console.debug(`[API:authenticate] ${url.toString()}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_key, secret_key }),
      });

      const body = await this.getBody(response) as { access_token?: string };

      if (!response.ok) {
        console.error(body);
        throw new Error(`Failed to authenticate ${access_key}`);
      }

      if (!body.access_token || typeof body.access_token !== "string") {
        throw new Error(`Invalid access token for ${access_key}`);
      }

      this.#accessToken = body.access_token;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }

      throw e;
    }
  }

  public async logout(): Promise<void> {
    this.#sessionCookie = null;
    this.#accessToken = null;
  }

  public async login<T = unknown>(email: string, password: string): Promise<T> {
    await this.logout();

    const loginResponse = await this.post<RPCResponse<T>>("/login", { email, password });
    if (!("result" in loginResponse.body)) {
      throw new UnauthorizedException();
    }

    const cookie = loginResponse.headers.get("set-cookie");
    if (!cookie) {
      throw new Error("Failed to get session cookie");
    }

    this.#sessionCookie = cookie.split(";")[0];

    return loginResponse.body.result.data as T;
  }

  public async legacyAuthenticate(email: string, password: string): Promise<void> {
    // Login
    await this.login(email, password);

    // Create a new application and get the access token
    const appResponse = await this.post("/applications", {
      name: `APIE2E Application ${faker.string.nanoid()}`,
    });

    if (!appResponse.ok) {
      throw new Error(`Failed to create application: ${appResponse.statusText}`);
    }

    const { token } = appResponse.body as { application: unknown; token: string };
    if (!token || typeof token !== "string") {
      throw new Error("Invalid access token received from application creation");
    }

    this.#accessToken = token;
  }

  public async createCredentials(operator_id: number, role: string): Promise<CreateCredentialsResult> {
    const response = await this.post<CreateCredentialsResult>(
      `/${this.#apiVersion}/auth/credentials`,
      { operator_id, role },
    );

    if (!response.ok) {
      throw new Error(`Failed to create credentials: ${response.statusText}`);
    }

    return response.body;
  }

  public async get<T extends string | object | null>(url: string): Promise<HTTPResponse<T>> {
    return await this.request<T>("GET", url);
  }

  public async post<T extends string | object | null>(url: string, body: object | BodyInit): Promise<HTTPResponse<T>> {
    return await this.request("POST", url, body);
  }

  public async request<T extends string | object | null>(
    method: "GET" | "POST",
    url: string,
    body?: object | BodyInit,
  ): Promise<HTTPResponse<T>> {
    const input = new URL(url, this.#baseUrl);
    const init: RequestInit = {
      method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    };

    if (this.#sessionCookie) {
      init.headers = {
        ...init.headers,
        Cookie: this.#sessionCookie,
      };
    }

    if (this.#accessToken) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${this.#accessToken}`,
      };
    }

    if (method === "POST") {
      init.body = typeof body === "object" ? JSON.stringify(body) : body;
    }

    try {
      // console.debug(`[API:${method}] ${input.toString()}`);
      const response = await fetch(input, init);
      const body = await this.getBody<T>(response);

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        redirected: response.redirected,
        headers: response.headers,
        body,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }

      return {
        ok: false,
        status: 0,
        statusText: "Network error",
        url: input.toString(),
        redirected: false,
        headers: new Headers(),
        body: null as T,
      };
    }
  }

  private async getBody<T extends string | object | null>(response: Response): Promise<T> {
    if (response.status === 204) return null as T;

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }

    return await response.text() as T;
  }
}

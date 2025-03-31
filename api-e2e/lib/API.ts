import { env } from "./config.ts";

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
  private baseUrl = env("APIE2E_API_URL", "http://localhost:8080");
  private apiVersion = env("APIE2E_API_VERSION", "v3");
  private accessToken: string | null = null;
  private defaultAccessKey: string;
  private defaultSecretKey: string;

  get token(): string | null {
    return this.accessToken;
  }

  constructor() {
    this.defaultAccessKey = env("APIE2E_AUTH_ACCESSKEY");
    this.defaultSecretKey = env("APIE2E_AUTH_SECRETKEY");
  }

  public async authenticate(access_key?: string, secret_key?: string): Promise<void> {
    access_key = access_key || this.defaultAccessKey;
    secret_key = secret_key || this.defaultSecretKey;

    try {
      const url = new URL(`/${this.apiVersion}/auth/access_token`, this.baseUrl);

      console.info(`[API:authenticate] ${url.toString()}`);
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

      this.accessToken = body.access_token;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }

      throw e;
    }
  }

  public async get(url: string): Promise<HTTPResponse> {
    const input = new URL(url, this.baseUrl);
    const init: RequestInit = {
      headers: {
        ContentType: "application/json",
      },
    };

    if (this.accessToken) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      console.info(`[API:get] ${input.toString()}`);
      const response = await fetch(input, init);
      const body = await this.getBody(response);

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
        body: null,
      };
    }
  }

  private async getBody(response: Response): Promise<string | object> {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  }
}

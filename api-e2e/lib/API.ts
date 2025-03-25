import { env } from "./config.ts";

export type HTTPResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  redirected: boolean;
  headers: Headers;
  body: any;
};

export class API {
  private baseUrl = env("APIE2E_API_URL", "http://localhost:8080");
  private apiVersion = env("APIE2E_API_VERSION", "v3");
  private accessToken: string | null = null;
  private defaultUsername: string;
  private defaultPassword: string;

  get token(): string | null {
    return this.accessToken;
  }

  constructor() {
    this.defaultUsername = env("APIE2E_AUTH_USERNAME");
    this.defaultPassword = env("APIE2E_AUTH_PASSWORD");
  }

  public async authenticate(username?: string, password?: string): Promise<void> {
    username = username || this.defaultUsername;
    password = password || this.defaultPassword;

    const response = await fetch(new URL(`/${this.apiVersion}/auth/access_token`, this.baseUrl), {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to authenticate ${username}`);
    }

    if (!body.access_token || typeof body.access_token !== "string") {
      throw new Error(`Invalid access token for ${username}`);
    }

    this.accessToken = body.access_token;
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

    const response = await fetch(input, init);

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      redirected: response.redirected,
      headers: response.headers,
      body: await response.json(),
    };
  }
}

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
  private baseUrl = "http://localhost:8080"; // FIXME use env
  private accessToken: string | null = null;

  get token(): string | null {
    return this.accessToken;
  }

  public async authenticate(username: string, password: string): Promise<void> {
    const response = await fetch(new URL("/auth/token", this.baseUrl), {
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

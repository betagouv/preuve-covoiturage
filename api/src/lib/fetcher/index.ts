import { NotFoundException } from "@/ilos/common/index.ts";

class Fetcher {
  async raw(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(input, init);
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException();
      }
      throw new Error(`HTTP Error ${response.status}`);
    }
    return response;
  }

  async get(input: string | URL, init?: RequestInit) {
    return this.raw(input, { ...init, method: "GET" });
  }

  async put(input: string | URL, init?: RequestInit) {
    return this.raw(input, { ...init, method: "PUT" });
  }

  async post(input: string | URL, init?: RequestInit) {
    return this.raw(input, { ...init, method: "POST" });
  }

  async delete(input: string | URL, init?: RequestInit) {
    return this.raw(input, { ...init, method: "DELETE" });
  }
}

export default new Fetcher();

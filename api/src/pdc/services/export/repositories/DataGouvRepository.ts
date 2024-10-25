import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import fetcher from "@/lib/fetcher/index.ts";
import { logger } from "@/lib/logger/index.ts";

export abstract class DataGouvRepositoryInterfaceResolver {
  // @ts-expect-error not initialized
  public datasetId: string;

  get(_url: string): Promise<Response> {
    throw new Error("Method not implemented.");
  }

  post(_url: string, _body: BodyInit): Promise<Response> {
    throw new Error("Method not implemented.");
  }

  put(_url: string, _body: BodyInit): Promise<Response> {
    throw new Error("Method not implemented.");
  }
}

@provider({ identifier: DataGouvRepositoryInterfaceResolver })
export class DataGouvRepository {
  private _apiKey: string;
  private _baseURL: string;
  private _datasetId: string;

  get datasetId(): string {
    return this._datasetId;
  }

  constructor(private config: ConfigInterfaceResolver) {
    this._apiKey = this.config.get("datagouv.datagouv.key");
    this._datasetId = this.config.get("datagouv.datagouv.dataset_id");
    this._baseURL = this.config.get("datagouv.datagouv.url").replace(/\/+$/, "");
  }

  public async get(url: string): Promise<Response> {
    return this.call(url, "GET");
  }

  public async post(url: string, body: BodyInit): Promise<Response> {
    return this.call(url, "POST", {}, body);
  }

  public async put(url: string, body: BodyInit): Promise<Response> {
    return this.call(url, "PUT", { "Content-type": "application/json" }, body);
  }

  protected async call(
    _url: string,
    method: "GET" | "POST" | "PUT" = "GET",
    _headers: Partial<HeadersInit> = {},
    body?: BodyInit,
  ): Promise<Response> {
    try {
      const headers: HeadersInit = { ..._headers, "X-API-KEY": this._apiKey };
      const url = `${this._baseURL}/${_url.replace(/^\/+/, "")}`;
      return await fetcher.raw(url, { method, headers, body });
    } catch (e) {
      logger.error(`DataGouvRepository: ${e.message}`);
      throw e;
    }
  }
}

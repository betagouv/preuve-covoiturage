import { ConfigInterfaceResolver, NotFoundException, provider } from "@/ilos/common/index.ts";
import { readFile } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { basename } from "@/lib/path/index.ts";
import { Dataset, Metadata, Resource } from "@/pdc/providers/datagouv/DataGouvAPITypes.ts";
import { DataGouvAPIConfig } from "@/pdc/services/export/config/datagouv.ts";

@provider()
export class DataGouvAPIProvider {
  protected _dataset: Dataset | null = null;
  protected _resource: Resource | null = null;
  protected config: DataGouvAPIConfig;

  constructor(protected configStore: ConfigInterfaceResolver) {
    this.config = configStore.get("datagouv.api");
  }

  // -------------------------------------------------------------------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Get all dataset metadata
   *
   * Includes organisations and the list of resources
   */
  public async dataset(): Promise<Dataset> {
    if (this._dataset) {
      return this._dataset;
    }

    const dataset = await this.get<Dataset>(`datasets/${this.config.dataset}`);
    if (!dataset) {
      throw new NotFoundException(`Dataset not found: ${this.config.dataset}`);
    }

    this._dataset = dataset;

    return this._dataset;
  }

  /**
   * Get a specific resource from the dataset by title.
   *
   * Defaults to the latest resource if no title is provided.
   *
   * @param title
   * @returns
   */
  public async resource(title: string | null = null): Promise<Resource> {
    const dataset = await this.dataset();
    const resource = title
      ? dataset.resources.find((r) => r.title === title)
      : dataset.resources.find((r) => r.latest.includes(r.id));

    if (!resource) {
      throw new NotFoundException(`Resource not found for dataset ${dataset.id}`);
    }

    this._resource = resource;
    return this._resource;
  }

  public async exists(title: string): Promise<boolean> {
    try {
      await this.resource(title);
      return true;
    } catch {
      return false;
    }
  }

  public async upload(filepath: string): Promise<Resource> {
    const title = basename(filepath);
    let url = `datasets/${this.config.dataset}/upload/`;

    if (await this.exists(title)) {
      logger.info(`Resource ${title} already exists, replacing...`);
      url = `datasets/${this.config.dataset}/resources/${this._resource!.id}/upload/`;
    }

    const form = new FormData();
    const file = new File([await readFile(filepath)], title);
    form.append("file", file);

    const resource = await this.post<Resource>(url, form);
    if (!resource) {
      throw new Error(`Failed to upload resource for dataset ${this.config.dataset}`);
    }

    this._resource = resource;

    return resource;
  }

  public async setMetadata(resource: Resource, metadata: Metadata): Promise<Resource> {
    const r = await this.put<Resource>(
      `datasets/${this.config.dataset}/resources/${resource.id}`,
      JSON.stringify({
        title: resource.title,
        ...metadata,
      }),
    );

    if (!r) {
      throw new Error(`Failed to update resource ${resource.id} metadata`);
    }

    this._resource = r;

    return this._resource;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // PRIVATE REQUEST HELPERS
  // -------------------------------------------------------------------------------------------------------------------

  protected async get<T>(url: string): Promise<T> {
    return this._query<T>(url);
  }

  protected async post<T>(url: string, body: BodyInit): Promise<T> {
    return this._query<T>(url, "POST", body);
  }

  protected async put<T>(url: string, body: BodyInit): Promise<T> {
    return this._query<T>(url, "PUT", body);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // INTERNALS
  // -------------------------------------------------------------------------------------------------------------------

  protected async _query<T>(
    url: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body: BodyInit | null = null,
  ): Promise<T> {
    const baseURL = this.config.url;
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": this.config.key,
    };

    const init: RequestInit = { method, headers };
    if (body) {
      init.body = body;
      if (body instanceof FormData) delete headers["Content-Type"];
    }

    const response = await fetch(`${baseURL}/${url}`, init);
    if (!response.ok) {
      throw Error(response.statusText);
    }

    return response.json() as T;
  }
}

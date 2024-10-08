import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import fetcher from "@/lib/fetcher/index.ts";
import { readFile } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { basename } from "https://deno.land/std@0.214.0/path/mod.ts";
import {
  DataGouvProviderInterface,
  Dataset,
  Resource,
  UploadedResource,
} from "../interfaces/index.ts";

@provider()
export class DataGouvProvider implements DataGouvProviderInterface {
  constructor(private config: ConfigInterfaceResolver) {}

  protected async call(
    url: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body?: BodyInit,
    isJsonContent: boolean = false,
  ): Promise<Response> {
    try {
      const baseURL = this.config.get("datagouv.baseURL");
      let headers: HeadersInit = {
        [this.config.get("datagouv.apiKeyHeader")]: this.config.get(
          "datagouv.apiKey",
        ),
      };
      if (isJsonContent) {
        headers = { ...headers, "Content-Type": "application/json" };
      }
      const response = await fetcher.raw(
        `${baseURL}/${url}`,
        {
          method,
          headers,
          body,
        },
      );
      return response;
    } catch (error) {
      logger.error(
        `Error while calling data gouv API; ${error.response?.status} : ${
          JSON.stringify(error.response?.data)
        }`,
      );
      throw error;
    }
  }

  async getDataset(slug: string): Promise<Dataset> {
    const response = await this.call(`/datasets/${slug}`);
    const data: Dataset = await response.json();
    return data;
  }

  async uploadDatasetResource(
    slug: string,
    filepath: string,
  ): Promise<UploadedResource> {
    const file = new File([await readFile(filepath)], basename(filepath));
    const form = new FormData();
    form.append("file", file);
    const response = await this.call(
      `/datasets/${slug}/upload/`,
      "POST",
      form,
    );
    return await response.json();
  }

  async updateDatasetResource(
    slug: string,
    filepath: string,
    resourceId: string,
  ): Promise<UploadedResource> {
    const form = new FormData();
    const file = new File([await readFile(filepath)], basename(filepath));
    form.append("file", file);
    const response = await this.call(
      `/datasets/${slug}/resources/${resourceId}/upload/`,
      "POST",
      form,
    );
    return await response.json();
  }

  async updateResource(
    datasetSlug: string,
    resource: Resource,
  ): Promise<Resource> {
    const response = await this.call(
      `/datasets/${datasetSlug}/resources/${resource.id}`,
      "PUT",
      JSON.stringify(resource),
      true,
    );
    return await response.json();
  }
}

import { ConfigInterfaceResolver, provider } from '@ilos/common';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { DataGouvProviderInterface, Dataset, Resource, UploadedResource } from '../interfaces';

@provider()
export class DataGouvProvider implements DataGouvProviderInterface {
  protected client: AxiosInstance;

  constructor(private config: ConfigInterfaceResolver) {}

  async init() {
    this.client = axios.create({
      baseURL: this.config.get('datagouv.baseURL'),
      headers: {
        [this.config.get('datagouv.apiKeyHeader')]: this.config.get('datagouv.apiKey'),
      },
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          `Error while calling data gouv API; ${error.response?.status} : ${JSON.stringify(error.response?.data)}`,
        );
        throw error;
      },
    );
  }

  async uploadResources(slug: string, filepath: string): Promise<UploadedResource> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filepath), { knownLength: fs.statSync(filepath).size });
    const response = await this.client.post<UploadedResource>(`/datasets/${slug}/upload/`, form, {
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync(),
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    });
    return response.data;
  }

  async getDataset(slug: string): Promise<Dataset> {
    const response = await this.client.get<Dataset>(`/datasets/${slug}/`);
    return response.data;
  }

  async updateDataset(dataset: Dataset): Promise<Dataset> {
    const response = await this.client.put<Dataset>(`/datasets/${dataset.slug}/`, dataset);
    return response.data;
  }

  async publishResource(datasetSlug: string, resource: Resource): Promise<string> {
    const response = await this.client.post<Resource>(`/datasets/${datasetSlug}/resources/`, resource);
    return response.data.id;
  }

  async updateResource(datasetSlug: string, resource: Resource): Promise<Resource> {
    const response = await this.client.put<Resource>(`/datasets/${datasetSlug}/resources/${resource.id}`, resource);
    return response.data;
  }

  async unpublishResource(datasetSlug: string, resourceId: string): Promise<void> {
    await this.client.delete(`/datasets/${datasetSlug}/${resourceId}/`);
  }

  async checkResource(datasetSlug: string, resourceId: string): Promise<void> {
    await this.client.get(`/datasets/${datasetSlug}/${resourceId}/`);
  }
}

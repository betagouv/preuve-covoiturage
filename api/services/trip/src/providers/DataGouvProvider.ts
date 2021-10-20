import { provider, ConfigInterfaceResolver } from '@ilos/common';
import axios, { AxiosInstance } from 'axios';
import { Dataset, Resource, DataGouvProviderInterface } from '../interfaces';

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
        console.error(`Error while calling data gouv API, status ${error.response.status}`);
        throw error;
      },
    );
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

  async unpublishResource(datasetSlug: string, resourceId: string): Promise<void> {
    await this.client.delete(`/datasets/${datasetSlug}/${resourceId}/`);
  }

  async checkResource(datasetSlug: string, resourceId: string): Promise<void> {
    await this.client.get(`/datasets/${datasetSlug}/${resourceId}/`);
  }
}

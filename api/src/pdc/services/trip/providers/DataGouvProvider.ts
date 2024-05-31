import { ConfigInterfaceResolver, provider } from '@ilos/common/index.ts';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import { DataGouvProviderInterface, Dataset, Resource, UploadedResource } from '../interfaces/index.ts';

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

  async getDataset(slug: string): Promise<Dataset> {
    const response = await this.client.get<Dataset>(`/datasets/${slug}`);
    return response.data;
  }

  async uploadDatasetResource(slug: string, filepath: string): Promise<UploadedResource> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filepath), { knownLength: fs.statSync(filepath).size });
    const response = await this.client.post<UploadedResource>(`/datasets/${slug}/upload/`, form, {
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync().toString(),
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    });
    return response.data;
  }

  async updateDatasetResource(slug: string, filepath: string, resourceId: string): Promise<UploadedResource> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filepath), { knownLength: fs.statSync(filepath).size });
    const response = await this.client.post<UploadedResource>(
      `/datasets/${slug}/resources/${resourceId}/upload/`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Content-Length': form.getLengthSync().toString(),
        },
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
      },
    );
    return response.data;
  }

  async updateResource(datasetSlug: string, resource: Resource): Promise<Resource> {
    const response = await this.client.put<Resource>(`/datasets/${datasetSlug}/resources/${resource.id}`, resource);
    return response.data;
  }
}

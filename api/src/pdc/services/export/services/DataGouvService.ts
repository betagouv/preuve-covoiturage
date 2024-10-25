import { provider } from "@/ilos/common/index.ts";
import { checksum as sha1sum, readFile } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { basename } from "@/lib/path/index.ts";
import { DataGouvRepositoryInterfaceResolver } from "@/pdc/services/export/repositories/DataGouvRepository.ts";
import { Dataset, Resource, UploadedResource } from "../interfaces/datagouv.ts";

export abstract class DataGouvServiceInterfaceResolver {
  getDataset(): Promise<Dataset> {
    throw new Error("Method not implemented.");
  }
  getResource(_rid: string): Promise<Resource> {
    throw new Error("Method not implemented.");
  }
  uploadNewResource(_filepath: string): Promise<UploadedResource> {
    throw new Error("Method not implemented.");
  }
  replaceResourceFile(_resourceId: string, _filepath: string): Promise<UploadedResource> {
    throw new Error("Method not implemented.");
  }
  replaceResourceDescription(_rid: string, _description: string): Promise<Resource> {
    throw new Error("Method not implemented.");
  }
  uploadResource(_filepath: string, _description: string): Promise<UploadedResource> {
    throw new Error("Method not implemented.");
  }
}

@provider({
  identifier: DataGouvServiceInterfaceResolver,
})
export class DataGouvService {
  private _datasetId: string;

  constructor(private datagouv: DataGouvRepositoryInterfaceResolver) {
    this._datasetId = this.datagouv.datasetId;
  }

  public async getDataset(): Promise<Dataset> {
    const response = await this.datagouv.get(`/datasets/${this._datasetId}`);

    return await response.json();
  }

  public async getResource(rid: string): Promise<Resource> {
    if (!rid.length) {
      throw new Error("Please provide a valid resource identifier to get");
    }

    const url = `datasets/${this._datasetId}/resources/${rid}`;
    const response = await this.datagouv.get(url);

    return await response.json();
  }

  public async uploadNewResource(filepath: string): Promise<UploadedResource> {
    const body = new FormData();
    body.append("file", new File([await readFile(filepath)], basename(filepath)));

    const url = `datasets/${this._datasetId}/upload`;
    const response = await this.datagouv.post(url, body);

    return await response.json();
  }

  public async replaceResourceFile(resourceId: string, filepath: string): Promise<UploadedResource> {
    const body = new FormData();
    body.append("file", new File([await readFile(filepath)], basename(filepath)));

    const url = `datasets/${this._datasetId}/resources/${resourceId}/upload`;
    const response = await this.datagouv.post(url, body);

    return await response.json();
  }

  public async replaceResourceDescription(rid: string, description: string): Promise<UploadedResource> {
    if (!rid.length) {
      throw new Error("Please provide a valid resource identifier to update");
    }

    const resource = await this.getResource(rid);
    resource.description = description;

    const url = `/datasets/${this._datasetId}/resources/${resource.id}`;
    const response = await this.datagouv.put(url, JSON.stringify(resource));

    return await response.json();
  }

  public async uploadResource(filepath: string, description: string): Promise<UploadedResource> {
    const filename = basename(filepath);

    // get the existing resource or upload a new one
    const existing = await this.getMatchingResource(filename, filepath);
    if (existing) logger.info(`Reuse existing resource ${existing.id} for ${filename}`);

    const resource = existing || await this.uploadNewResource(filepath);
    if (!resource || !resource.success || !resource.id) {
      throw new Error(`Failed to upload ${filename}`);
    }

    if (description === resource.description) {
      throw new Error(`Description of ${filename} is already up to date`);
    }

    // update the description if it has changed
    const updated = await this.replaceResourceDescription(resource.id, description);

    if (!updated) {
      throw new Error(`Failed to update description of ${filename}`);
    }

    return updated;
  }

  private async getMatchingResource(filename: string, filepath: string): Promise<UploadedResource | null> {
    const dataset = await this.getDataset();

    if (!dataset.resources || !dataset.resources.length) {
      return null;
    }

    const found = dataset.resources.find((r) => r.title === filename);
    if (!found) return null;

    // dump the resource if the checksums don't match
    if (!await this.equalChecksums(filepath, found.checksum)) {
      logger.info(`Checksum mismatch for ${filename}`);
      return null;
    }

    // add the success flag to the existing resource to match the
    // UploadedResource interface
    return { ...found, success: true };
  }

  private async equalChecksums(filepath: string, checksum: unknown): Promise<boolean> {
    if (!checksum || typeof checksum !== "object") {
      return false;
    }

    const { type, value } = checksum as { type: string; value: string };
    if (!type || !value) {
      return false;
    }

    const hash = await sha1sum(filepath, "SHA-1");
    return hash === value;
  }
}

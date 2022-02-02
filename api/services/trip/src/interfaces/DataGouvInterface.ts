import { InitHookInterface } from '@ilos/common';

export enum Frequency {
  'unknown',
  'punctual',
  'continuous',
  'hourly',
  'fourTimesADay',
  'threeTimesADay',
  'semidaily',
  'daily',
  'fourTimesAWeek',
  'threeTimesAWeek',
  'semiweekly',
  'weekly',
  'biweekly',
  'threeTimesAMonth',
  'semimonthly',
  'monthly',
  'bimonthly',
  'quarterly',
  'threeTimesAYear',
  'semiannual',
  'annual',
  'biennial',
  'triennial',
  'quinquennial',
  'irregular',
}

export interface Resource {
  checksum?: {
    type?: 'sha1' | 'sha2' | 'sha256' | 'md5' | 'crc';
    value: string;
  };
  created_at?: string;
  description?: string;
  extras?: { [k: string]: any };
  filesize?: number;
  filetype: 'file' | 'remote';
  format: string;
  id?: string;
  last_modified?: string;
  latest?: string;
  metrics?: { [k: string]: any };
  mime?: string;
  preview_url?: string;
  published?: string;
  schema?: { [k: string]: any };
  title: string;
  type: 'main' | 'documentation' | 'update' | 'api' | 'code' | 'other';
  url: string;
}
export interface CommonReference {
  class: string;
  id: string;
}
export interface UserReference extends CommonReference {
  avatar?: string;
  avatar_thumbnail?: string;
  slug: string;
  uri: string;
}

export interface OrganizationReference extends CommonReference {
  acronym?: string;
  logo?: string;
  logo_thumbnail?: string;
  slug: string;
}
export interface CommunityResource extends Resource {
  dataset?: Dataset;
  organization?: OrganizationReference;
  owner?: UserReference;
}
export interface Dataset {
  acronym?: string;
  archived?: string;
  badges?: Array<{ kind: string }>;
  community_resources?: Array<CommunityResource>;
  created_at: string;
  deleted?: string;
  description: string;
  extras?: { [k: string]: any };
  featured?: boolean;
  frequency: Frequency;
  frequency_date?: string;
  id?: string;
  last_modified: string;
  last_update: string;
  license?: string;
  metrics?: { [k: string]: any };
  organization?: OrganizationReference;
  owner?: UserReference;
  page: string;
  private?: boolean;
  quality?: { [k: string]: any };
  resources?: Array<Resource>;
  slug: string;
  spatial?: {
    geom: { [k: string]: any };
    granularity: string;
    zones: Array<string>;
  };
  tags?: Array<string>;
  temporal_coverage?: {
    end: string;
    start: string;
  };
  title: string;
  uri: string;
}
export interface UploadedResource extends Resource {
  success: boolean;
}

export interface DataGouvProviderInterface extends InitHookInterface {
  getDataset(slug: string): Promise<Dataset>;
  updateResource(datasetSlug: string, resource: Resource): Promise<Resource>;
  uploadDatasetResource(slug: string, filepath: string): Promise<UploadedResource>;
  updateDatasetResource(slug: string, filepath: string, resourceId: string): Promise<UploadedResource>;
}

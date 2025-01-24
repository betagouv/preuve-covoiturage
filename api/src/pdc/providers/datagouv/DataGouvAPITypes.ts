export type Organisation = {
  acronym: string;
  badges: { kind: string }[];
  class: string;
  id: string;
  logo: string;
  logo_thumbnail: string;
  name: string;
  page: string;
  slug: string;
  uri: string;
};

export type Dataset = {
  acronym: string;
  archived: null | string;
  badges: { kind: string }[];
  contact_point: null | string;
  created_at: string;
  deleted: null | string;
  description: string;
  extras: {
    "recommendations-externals": {
      id: string;
      messages: { en: object; fr: object };
      score: number;
      source: string;
    }[];
    "recommendations:sources": string[];
  };
  frequency: string;
  frequency_date: string;
  harvest: null | string;
  id: string;
  internal: {
    created_at_internal: string;
    last_modified_internal: string;
  };
  last_modified: string;
  last_update: string;
  license: string;
  metrics: {
    discussions: number;
    followers: number;
    resources_downloads: number;
    reuses: number;
    views: number;
  };
  organization: Organisation;
  owner: null | string;
  page: string;
  private: boolean;
  quality: {
    all_resources_available: boolean;
    dataset_description_quality: boolean;
    has_open_format: boolean;
    has_resources: boolean;
    license: boolean;
    resources_documentation: boolean;
    score: number;
    spatial: boolean;
    temporal_coverage: boolean;
    update_frequency: boolean;
    update_fulfilled_in_time: boolean;
  };
  resources: Resource[];
  schema: null | string;
  slug: string;
  spatial: {
    geom: null | string;
    granularity: string;
    zones: string[];
  };
  tags: string[];
  temporal_coverage: { end: string; start: string };
  title: string;
  uri: string;
};

export type Resource = {
  checksum: {
    type: "sha1";
    value: string;
  };
  created_at: string;
  description: null | string;
  extras: {
    "check:available": boolean;
    "check:date": string;
    "check:headers:content-type": string;
    "check:status": number;
    "check:timeout": boolean;
  };
  filesize: number;
  filetype: string;
  format: string;
  harvest: null | string;
  id: string;
  internal: {
    created_at_internal: string;
    last_modified_internal: string;
  };
  last_modified: string;
  latest: string;
  metrics: Record<string, unknown>;
  mime: string;
  preview_url: null | string;
  schema: { name: null | string; url: null | string; version: null | string };
  title: string;
  type: string;
  url: string;
};

export type Metadata = {
  description: string;
};

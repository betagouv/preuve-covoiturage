export type ContextType = {
  channel: {
    service: string;
    transport?: string;
    metadata?: any;
  };
  call?: {
    user: any;
    metadata?: any;
    api_version_range?: string;
  };
};

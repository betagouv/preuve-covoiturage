export type ContextType = {
  channel: {
    service: string;
    transport?: string;
    metadata?: any;
    api_version?: string;
  };
  call?: {
    user: any;
    metadata?: any;
  };
};

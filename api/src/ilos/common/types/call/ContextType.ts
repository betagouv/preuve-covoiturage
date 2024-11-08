export type ContextType = {
  channel: {
    service: string;
    transport?: string;
    metadata?: any;
    api_version?: number;
  };
  call?: {
    user: any;
    metadata?: any;
  };
};

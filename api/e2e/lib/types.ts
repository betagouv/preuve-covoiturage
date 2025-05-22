type RPCResponseResult<T> = {
  jsonrpc: string;
  id: number;
  result: {
    meta: unknown | null;
    data: T;
  };
};

type RPCResponseError = {
  jsonrpc: string;
  id: number;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export type RPCResponse<T> = RPCResponseResult<T> | RPCResponseError;

export type CreateJourneyResponse = RPCResponse<{
  operator_journey_id: string;
  created_at: string;
}>;

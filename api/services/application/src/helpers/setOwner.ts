import { InvalidParamsException, ContextType } from '@ilos/common';

export function setOwner<T>(service: 'operator', params: any, context: ContextType): T {
  const data = { ...params } as T & { owner_id: number | string; owner_service: string };
  const key = `${service}_id`;

  // force owner to be the user's service
  if (key in context.call.user) {
    data.owner_id = context.call.user[key];
    data.owner_service = service;
  }

  if (!data.owner_id || !data.owner_service) {
    throw new InvalidParamsException('Application owner service must be set');
  }

  return data;
}

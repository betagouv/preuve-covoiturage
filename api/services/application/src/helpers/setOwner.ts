import { InvalidParamsException, ContextType } from '@ilos/common';

export function setOwner<T>(service: 'operator', params: any, context: ContextType): T {
  const data = <T & { owner_id: string; owner_service: string }>{ ...params };

  // force owner to be the user's service
  if (service in context.call.user) {
    data.owner_id = context.call.user[service];
    data.owner_service = service;
  }

  if (!data.owner_id || !data.owner_service) {
    throw new InvalidParamsException('Application owner service must be set');
  }

  return data;
}

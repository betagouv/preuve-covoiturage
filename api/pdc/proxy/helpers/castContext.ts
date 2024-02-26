import { ContextType } from '@ilos/common';
import { UserInterface } from '@shared/user/common/interfaces/UserInterface';

export function castContext(user?: Partial<UserInterface>, metadata?: any): ContextType {
  const call = { user, metadata };

  return {
    call,
    channel: {
      service: 'proxy',
      transport: 'http',
    },
  };
}

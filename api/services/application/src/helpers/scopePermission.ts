import { ContextType } from '@ilos/common';

export function scopePermission(scope: 'operator' | 'territory', action: string): Function {
  return (params, context: ContextType): string => {
    if (
      context.call.user[scope] &&
      'owner_id' in params &&
      params.owner_id === context.call.user[scope] &&
      'owner_service' in params &&
      params.owner_service === scope
    ) {
      return `${scope}.application.${action}`;
    }
  };
}

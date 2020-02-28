import { ReducerInterface } from '../interfaces/ReducerInterface';

export function reduceRoles(roles: string[], group: string, role: string): ReducerInterface {
  return (p: boolean, c: string): boolean => {
    switch (c.toLowerCase()) {
      case 'superadmin':
        return p && group === 'registry' && role === 'admin';
      case 'admin':
        return p && role === 'admin';
      case 'user':
        return p && role === 'user';
      default:
        return p && group === c;
    }
  };
}

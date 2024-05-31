import { ParamsType } from './ParamsType.ts';
import { ContextType } from './ContextType.ts';

export type ParamsWithContextType = {
  params?: ParamsType;
  _context: ContextType;
};

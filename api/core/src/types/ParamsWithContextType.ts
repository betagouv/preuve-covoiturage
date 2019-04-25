import { ParamsType } from './ParamsType';
import { ContextType } from './ContextType';

export type ParamsWithContextType = {
  params?: ParamsType,
  _context: ContextType,
};

import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Pdll } from './Pdll';
import { Smt } from './Smt';

export const policies = (): Map<string, PolicyHandlerStaticInterface> => {
  const map: Map<string, PolicyHandlerStaticInterface> = new Map();
  map.set(Idfm.id, Idfm);
  map.set(Pdll.id, Pdll);
  map.set(Smt.id, Smt);
  return map;
};

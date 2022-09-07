import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Pdll } from './Pdll';

export const policies = (): Map<string, PolicyHandlerStaticInterface> => {
  const map: Map<string, PolicyHandlerStaticInterface> = new Map();
  map.set(Idfm.id, Idfm);
  map.set(Pdll.id, Pdll);
  return map;
};

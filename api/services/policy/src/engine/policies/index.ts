import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Nm } from './Nm';
import { Mrn } from './Mrn';
import { Pdll } from './Pdll';
import { Smt } from './Smt';
import { Laval } from './Laval';

export const policies = (): Map<string, PolicyHandlerStaticInterface> => {
  const map: Map<string, PolicyHandlerStaticInterface> = new Map();
  map.set(Idfm.id, Idfm);
  map.set(Pdll.id, Pdll);
  map.set(Smt.id, Smt);
  map.set(Nm.id, Nm);
  map.set(Laval.id, Laval);
  map.set(Mrn.id, Mrn);
  return map;
};

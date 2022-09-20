import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Nm } from './Nm';
import { Mrn } from './Mrn';
import { Pdll } from './Pdll';
import { Smt } from './Smt';
import { Laval } from './Laval';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  [Idfm, Nm, Mrn, Pdll, Smt, Laval].map((h) => [h.id, h]),
);

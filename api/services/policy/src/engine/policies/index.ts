import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Laval } from './Laval';
import { Lannion } from './Lannion';
import { Mrn } from './Mrn';
import { Nm } from './Nm';
import { Pmgf } from './Pmgf';
import { Pdll } from './Pdll';
import { Smt } from './Smt';
import { Occitanie } from './Occitanie';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  [Idfm, Nm, Mrn, Pdll, Pmgf, Smt, Lannion, Laval, Occitanie].map((h) => [h.id, h]),
);

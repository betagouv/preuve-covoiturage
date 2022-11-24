import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Laval } from './Laval';
import { Mrn } from './Mrn';
import { Nm } from './Nm';
import { Pdll } from './Pdll';
import { Smt } from './Smt';
import { PolicyTemplateOne } from './PolicyTemplateOne';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  [Idfm, Nm, Mrn, Pdll, Smt, Laval, PolicyTemplateOne].map((h) => [h.id, h]),
);

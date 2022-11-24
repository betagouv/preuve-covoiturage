import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Laval } from './Laval';
import { Mrn } from './Mrn';
import { Nm } from './Nm';
import { Pdll } from './Pdll';
import { Smt } from './Smt';
import { PolicyTemplateOne } from './unbound/PolicyTemplateOne';
import { PolicyTemplateThree } from './unbound/PolicyTemplateThree';
import { PolicyTemplateTwo } from './unbound/PolicyTemplateTwo';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  [Idfm, Nm, Mrn, Pdll, Smt, Laval, PolicyTemplateOne, PolicyTemplateTwo, PolicyTemplateThree].map((h) => [h.id, h]),
);

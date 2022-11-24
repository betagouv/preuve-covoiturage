import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Lannion } from './Lannion';
import { Laval } from './Laval';
import { Mrn } from './Mrn';
import { Nm } from './Nm';
import { Occitanie } from './Occitanie';
import { Pdll } from './Pdll';
import { Pmgf } from './Pmgf';
import { PolicyTemplateOne } from './PolicyTemplateOne';
import { Smt } from './Smt';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  // disable prettier to avoid having it reformat to a single line
  // this helps with git conflicts when modifying the list.
  /* eslint-disable prettier/prettier */
  [
    Idfm,
    Lannion,
    Laval,
    Mrn,
    Nm,
    Occitanie,
    Pdll,
    Pmgf,
    PolicyTemplateOne,
    Smt,
  ].map((h) => [h.id, h]),
  /* eslint-enable prettier/prettier */
);

import { Cotentin } from './Cotentin';
import { Pdll2023 } from './Pdll2023';
import { Vitre } from './Vitre';
import { Montpellier } from './Montpellier';
import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';
import { Lannion } from './Lannion';
import { Laval } from './Laval';
import { Mrn } from './Mrn';
import { Nm } from './Nm';
import { Occitanie } from './Occitanie';
import { Pdll } from './Pdll';
import { Pmgf } from './Pmgf';
import { Smt } from './Smt';
import { PolicyTemplateOne } from './unbound/PolicyTemplateOne';
import { PolicyTemplateThree } from './unbound/PolicyTemplateThree';
import { PolicyTemplateTwo } from './unbound/PolicyTemplateTwo';
import { MetropoleSavoie } from './MetropoleSavoie';
import { Smt2023 } from './Smt2023';
import { LaRochelle } from './LaRochelle';
import { PaysBasque } from './PaysBasque';
import { Atmb } from './Atmb';
import { Pmgf2023 } from './Pmgf2023';
import { GrandPoitiers } from './GrandPoitiers';
import { PmgfLate2023 } from './PmgfLate2023';

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
    PolicyTemplateThree,
    PolicyTemplateTwo,
    Smt,
    Montpellier,
    MetropoleSavoie,
    Smt2023,
    Vitre,
    Pdll2023,
    Cotentin,
    LaRochelle,
    PaysBasque,
    Atmb,
    Pmgf2023,
    GrandPoitiers,
    PmgfLate2023,
  ].map((h) => [h.id, h]),
  /* eslint-enable prettier/prettier */
);

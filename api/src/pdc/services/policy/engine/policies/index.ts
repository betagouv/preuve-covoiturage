import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Atmb } from './Atmb';
import { Cannes } from './Cannes';
import { Cotentin } from './Cotentin';
import { GrandPoitiers } from './GrandPoitiers';
import { Idfm } from './Idfm';
import { LaRochelle } from './LaRochelle';
import { Lannion } from './Lannion';
import { Laval } from './Laval';
import { MetropoleSavoie } from './MetropoleSavoie';
import { Montpellier } from './Montpellier';
import { Mrn } from './Mrn';
import { NantesMetropole2024 } from './NantesMetropole2024';
import { Nm } from './Nm';
import { Occitanie } from './Occitanie';
import { PaysBasque } from './PaysBasque';
import { Pdll } from './Pdll';
import { Pdll2023 } from './Pdll2023';
import { Pdll2024 } from './Pdll2024';
import { PetrLunevilloisS12023 } from './PetrLunevilloisS12023';
import { Pmgf } from './Pmgf';
import { Pmgf2023 } from './Pmgf2023';
import { PmgfLate2023 } from './PmgfLate2023';
import { SMTC } from './SMTC';
import { Smt } from './Smt';
import { Smt2023 } from './Smt2023';
import { Vitre } from './Vitre';
import { PolicyTemplateOne } from './unbound/PolicyTemplateOne';
import { PolicyTemplateThree } from './unbound/PolicyTemplateThree';
import { PolicyTemplateTwo } from './unbound/PolicyTemplateTwo';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  // disable prettier to avoid having it reformat to a single line
  // this helps with git conflicts when modifying the list.
  /* eslint-disable prettier/prettier */
  [
    Atmb,
    Cannes,
    Cotentin,
    GrandPoitiers,
    Idfm,
    Lannion,
    LaRochelle,
    Laval,
    MetropoleSavoie,
    Montpellier,
    Mrn,
    Nm,
    NantesMetropole2024,
    Occitanie,
    PaysBasque,
    Pdll,
    Pdll2023,
    Pdll2024,
    PetrLunevilloisS12023,
    Pmgf,
    Pmgf2023,
    PmgfLate2023,
    PolicyTemplateOne,
    PolicyTemplateThree,
    PolicyTemplateTwo,
    Smt,
    Smt2023,
    SMTC,
    Vitre,
  ].map((h) => [h.id, h]),
  /* eslint-enable prettier/prettier */
);

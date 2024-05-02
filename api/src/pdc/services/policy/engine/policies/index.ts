import { PolicyHandlerStaticInterface } from '../../interfaces';
import { ATMB202305 } from './ATMB202305';
import { Cannes2024 } from './Cannes2024';
import { Cotentin2023 } from './Cotentin2023';
import { GrandChatellerault2024 } from './GrandChatellerault2024';
import { GrandPoitiers } from './GrandPoitiers';
import { Idfm } from './Idfm';
import { LaRochelle20232024 } from './LaRochelle20232024';
import { Lannion } from './Lannion';
import { LannionTregor2024 } from './LannionTregor2024';
import { Laval } from './Laval';
import { MetropoleSavoie } from './MetropoleSavoie';
import { Montpellier } from './Montpellier';
import { Mrn } from './Mrn';
import { NantesMetropole2024 } from './NantesMetropole2024';
import { Nm } from './Nm';
import { Occitanie20232024 } from './Occitanie20232024';
import { PMGFxATMB2024 } from './PMGFxATMB2024';
import { PaysBasque20232024 } from './PaysBasque20232024';
import { PaysDeLaLoire2021 } from './PaysDeLaLoire2021';
import { PaysDeLaLoire2023 } from './PaysDeLaLoire2023';
import { PaysDeLaLoire2024 } from './PaysDeLaLoire2024';
import { PetrLunevilloisS12023 } from './PetrLunevilloisS12023';
import { Pmgf } from './Pmgf';
import { Pmgf2023 } from './Pmgf2023';
import { PmgfLate2023 } from './PmgfLate2023';
import { SMT2022 } from './SMT2022';
import { SMT2023 } from './SMT2023';
import { SMTC2024 } from './SMTC2024';
import { TerresTouloises2024 } from './TerresTouloises2024';
import { Vitre2023 } from './Vitre2023';
import { PolicyTemplateOne } from './unbound/PolicyTemplateOne';
import { PolicyTemplateThree } from './unbound/PolicyTemplateThree';
import { PolicyTemplateTwo } from './unbound/PolicyTemplateTwo';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  // disable prettier to avoid having it reformat to a single line
  // this helps with git conflicts when modifying the list.
  /* eslint-disable prettier/prettier */
  [
    ATMB202305,
    Cannes2024,
    Cotentin2023,
    GrandChatellerault2024,
    GrandPoitiers,
    Idfm,
    Lannion,
    LannionTregor2024,
    LaRochelle20232024,
    Laval,
    MetropoleSavoie,
    Montpellier,
    Mrn,
    NantesMetropole2024,
    Nm,
    Occitanie20232024,
    PaysBasque20232024,
    PaysDeLaLoire2021,
    PaysDeLaLoire2023,
    PaysDeLaLoire2024,
    PetrLunevilloisS12023,
    Pmgf,
    Pmgf2023,
    PmgfLate2023,
    PMGFxATMB2024,
    PolicyTemplateOne,
    PolicyTemplateThree,
    PolicyTemplateTwo,
    SMT2022,
    SMT2023,
    SMTC2024,
    TerresTouloises2024,
    Vitre2023,
  ].map((h) => [h.id, h]),
  /* eslint-enable prettier/prettier */
);

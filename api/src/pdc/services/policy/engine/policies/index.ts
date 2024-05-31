import { PolicyHandlerStaticInterface } from '../../interfaces/index.ts';
import { ATMB202305 } from './ATMB202305.ts';
import { Cannes2024 } from './Cannes2024.ts';
import { Cotentin2023 } from './Cotentin2023.ts';
import { GrandChatellerault2024 } from './GrandChatellerault2024.ts';
import { GrandPoitiers } from './GrandPoitiers.ts';
import { Idfm } from './Idfm.ts';
import { LaRochelle20232024 } from './LaRochelle20232024.ts';
import { Lannion } from './Lannion.ts';
import { LannionTregor2024 } from './LannionTregor2024.ts';
import { Laval } from './Laval.ts';
import { MetropoleSavoie } from './MetropoleSavoie.ts';
import { Montpellier } from './Montpellier.ts';
import { Mrn } from './Mrn.ts';
import { NantesMetropole2024 } from './NantesMetropole2024.ts';
import { Nm } from './Nm.ts';
import { Occitanie20232024 } from './Occitanie20232024.ts';
import { PMGFxATMB2024 } from './PMGFxATMB2024.ts';
import { PaysBasque20232024 } from './PaysBasque20232024.ts';
import { PaysDeLaLoire2021 } from './PaysDeLaLoire2021.ts';
import { PaysDeLaLoire2023 } from './PaysDeLaLoire2023.ts';
import { PaysDeLaLoire2024 } from './PaysDeLaLoire2024.ts';
import { PetrLunevilloisS12023 } from './PetrLunevilloisS12023.ts';
import { Pmgf } from './Pmgf.ts';
import { Pmgf2023 } from './Pmgf2023.ts';
import { PmgfLate2023 } from './PmgfLate2023.ts';
import { SMT2022 } from './SMT2022.ts';
import { SMT2023 } from './SMT2023.ts';
import { SMTC2024 } from './SMTC2024.ts';
import { SMTC2024Passenger } from './SMTC2024Passenger.ts';
import { TerresTouloises2024 } from './TerresTouloises2024.ts';
import { Vitre2023 } from './Vitre2023.ts';
import { PolicyTemplateOne } from './unbound/PolicyTemplateOne.ts';
import { PolicyTemplateThree } from './unbound/PolicyTemplateThree.ts';
import { PolicyTemplateTwo } from './unbound/PolicyTemplateTwo.ts';

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
    SMTC2024Passenger,
    TerresTouloises2024,
    Vitre2023,
  ].map((h) => [h.id, h]),
  /* eslint-enable prettier/prettier */
);

import { PolicyHandlerStaticInterface } from '../../interfaces';
import { PaysDeLaLoire2021 } from './20210105_PaysDeLaLoire';
import { IDFMPeriodeNormale2021 } from './20210520_IDFM';
import { NantesMetropoleXPCovoitan2021 } from './20211202_NantesMetropoleXP';
import { LavalAgglo2022 } from './20220412_LavalAgglo';
import { SMT2022 } from './20220414_SMT';
import { MetropoleRouenNormandie2022 } from './20220420_MetropoleRouenNormandie';
import { Occitanie20232024 } from './20221024_Occitanie';
import { PMGF2022 } from './20221102_PMGF';
import { Montpellier } from './20221206_Montpellier';
import { Cotentin2023 } from './20230101_Cotentin';
import { LaRochelle20232024 } from './20230101_LaRochelle';
import { Vitre2023 } from './20230101_Vitre';
import { MetropoleSavoie } from './20230124_MetropoleSavoie';
import { SMT2023 } from './20230126_SMT';
import { PaysDeLaLoire2023 } from './20230201_PaysDeLaLoire';
import { PaysBasque20232024 } from './20230401_PaysBasqueAdour';
import { Lannion202305 } from './20230501_Lannion';
import { ATMB202305 } from './20230502_ATMB';
import { PMGF2023 } from './20230502_PMGF';
import { GrandPoitiers } from './20230927_GrandPoitiers';
import { PMGFOctobre2023 } from './20231001_PMGF';
import { Cannes2024 } from './20240101_Cannes';
import { NantesMetropole2024 } from './20240101_NantesMetropole';
import { PaysDeLaLoire2024 } from './20240101_PaysDeLaLoire';
import { SMTC2024 } from './20240101_SMTC';
import { PetrLunevilloisS12023 } from './20240108_PetrLunevillois';
import { GrandChatellerault2024 } from './20240201_GrandChatellerault';
import { TerresTouloises2024 } from './20240201_TerresTouloises';
import { LannionTregor2024 } from './20240401_LannionTregor';
import { PMGFxATMB2024 } from './20240401_PMGFxATMB';
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
    IDFMPeriodeNormale2021,
    Lannion202305,
    LannionTregor2024,
    LaRochelle20232024,
    LavalAgglo2022,
    MetropoleRouenNormandie2022,
    MetropoleSavoie,
    Montpellier,
    NantesMetropole2024,
    NantesMetropoleXPCovoitan2021,
    Occitanie20232024,
    PaysBasque20232024,
    PaysDeLaLoire2021,
    PaysDeLaLoire2023,
    PaysDeLaLoire2024,
    PetrLunevilloisS12023,
    PMGF2022,
    PMGF2023,
    PMGFOctobre2023,
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

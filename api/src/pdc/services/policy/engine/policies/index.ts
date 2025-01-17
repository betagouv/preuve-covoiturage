import { PaysDeLaLoire2021 } from "@/pdc/services/policy/engine/policies/20210105_PaysDeLaLoire.ts";
import { IDFMPeriodeNormale2021 } from "@/pdc/services/policy/engine/policies/20210520_IDFM.ts";
import { NantesMetropoleXPCovoitan2021 } from "@/pdc/services/policy/engine/policies/20211202_NantesMetropoleXP.ts";
import { LavalAgglo2022 } from "@/pdc/services/policy/engine/policies/20220412_LavalAgglo.ts";
import { SMT2022 } from "@/pdc/services/policy/engine/policies/20220414_SMT.ts";
import { MetropoleRouenNormandie2022 } from "@/pdc/services/policy/engine/policies/20220420_MetropoleRouenNormandie.ts";
import { Occitanie20232024 } from "@/pdc/services/policy/engine/policies/20221024_Occitanie.ts";
import { PMGF2022 } from "@/pdc/services/policy/engine/policies/20221102_PMGF.ts";
import { Montpellier } from "@/pdc/services/policy/engine/policies/20221206_Montpellier.ts";
import { Cotentin2023 } from "@/pdc/services/policy/engine/policies/20230101_Cotentin.ts";
import { LaRochelle20232024 } from "@/pdc/services/policy/engine/policies/20230101_LaRochelle.ts";
import { Vitre2023 } from "@/pdc/services/policy/engine/policies/20230101_Vitre.ts";
import { MetropoleSavoie } from "@/pdc/services/policy/engine/policies/20230124_MetropoleSavoie.ts";
import { SMT2023 } from "@/pdc/services/policy/engine/policies/20230126_SMT.ts";
import { PaysDeLaLoire2023 } from "@/pdc/services/policy/engine/policies/20230201_PaysDeLaLoire.ts";
import { PaysBasque20232024 } from "@/pdc/services/policy/engine/policies/20230401_PaysBasqueAdour.ts";
import { Lannion202305 } from "@/pdc/services/policy/engine/policies/20230501_Lannion.ts";
import { ATMB202305 } from "@/pdc/services/policy/engine/policies/20230502_ATMB.ts";
import { PMGF2023 } from "@/pdc/services/policy/engine/policies/20230502_PMGF.ts";
import { GrandPoitiers } from "@/pdc/services/policy/engine/policies/20230927_GrandPoitiers.ts";
import { PMGFOctobre2023 } from "@/pdc/services/policy/engine/policies/20231001_PMGF.ts";
import { Cannes2024 } from "@/pdc/services/policy/engine/policies/20240101_Cannes.ts";
import { LaRochelle2024 } from "@/pdc/services/policy/engine/policies/20240101_LaRochelle.ts";
import { NantesMetropole2024 } from "@/pdc/services/policy/engine/policies/20240101_NantesMetropole.ts";
import { PaysDeLaLoire2024 } from "@/pdc/services/policy/engine/policies/20240101_PaysDeLaLoire.ts";
import { SMTC2024Passenger } from "@/pdc/services/policy/engine/policies/20240101_SMTC2024Passenger.ts";
import { SMTC2024Driver } from "@/pdc/services/policy/engine/policies/20240101_SMTCDriver.ts";
import { PetrLunevilloisS12023 } from "@/pdc/services/policy/engine/policies/20240108_PetrLunevillois.ts";
import { GrandChatellerault2024 } from "@/pdc/services/policy/engine/policies/20240201_GrandChatellerault.ts";
import { TerresTouloises2024 } from "@/pdc/services/policy/engine/policies/20240201_TerresTouloises.ts";
import { LannionTregor2024 } from "@/pdc/services/policy/engine/policies/20240401_LannionTregor.ts";
import { PMGFxATMB2024 } from "@/pdc/services/policy/engine/policies/20240401_PMGFxATMB.ts";
import { CCVMM202405 } from "@/pdc/services/policy/engine/policies/20240805_CCVMM_2024_05.ts";
import { SiouleLimagne } from "@/pdc/services/policy/engine/policies/20240901_SiouleLimagne_2024_09.ts";
import { PetrLunevillois092024032025 } from "@/pdc/services/policy/engine/policies/20240902_PetrLunevillois.ts";
import { CCPOA202410 } from "@/pdc/services/policy/engine/policies/20241015_CCPOA_orthe_et_arrigans_2024.ts";
import { GrandPoitiers2025 } from "@/pdc/services/policy/engine/policies/20250101_GrandPoitiers2025.ts";
import { PolicyTemplateOne } from "@/pdc/services/policy/engine/policies/unbound/PolicyTemplateOne.ts";
import { PolicyTemplateThree } from "@/pdc/services/policy/engine/policies/unbound/PolicyTemplateThree.ts";
import { PolicyTemplateTwo } from "@/pdc/services/policy/engine/policies/unbound/PolicyTemplateTwo.ts";
import { PolicyHandlerStaticInterface } from "@/pdc/services/policy/interfaces/index.ts";

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map(
  [
    ATMB202305,
    Cannes2024,
    CCPOA202410,
    CCVMM202405,
    Cotentin2023,
    GrandChatellerault2024,
    GrandPoitiers,
    GrandPoitiers2025,
    IDFMPeriodeNormale2021,
    Lannion202305,
    LannionTregor2024,
    LaRochelle20232024,
    LaRochelle2024,
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
    PetrLunevillois092024032025,
    PetrLunevilloisS12023,
    PMGF2022,
    PMGF2023,
    PMGFOctobre2023,
    PMGFxATMB2024,
    PolicyTemplateOne,
    PolicyTemplateThree,
    PolicyTemplateTwo,
    SiouleLimagne,
    SMT2022,
    SMT2023,
    SMTC2024Driver,
    SMTC2024Passenger,
    TerresTouloises2024,
    Vitre2023,
  ].map((h) => [h.id, h]),
);

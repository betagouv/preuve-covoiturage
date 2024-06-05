import { CreateGeoTable } from './datastructure/000_CreateGeoTable.ts';
import { CreateComEvolutionTable } from './datastructure/001_CreateComEvolutionTable.ts';
import { CreateGeoCentroidTable } from './datastructure/002_CreateGeoCentroidTable.ts';
import { CreateGetLatestByPointFunction } from './datafunctions/000_CreateGetLatestByPointFunction.ts';
import { CreateGetByPointFunction } from './datafunctions/001_CreateGetByPointFunction.ts';
import { CreateGetLatestByCodeFunction } from './datafunctions/002_CreateGetLatestByCodeFunction.ts';
import { CreateGetByCodeFunction } from './datafunctions/003_CreateGetByCodeFunction.ts';
import { CreateGetLatestMillesimeFunction } from './datafunctions/004_CreateGetLatestMillesimeFunction.ts';
import { CreateGetLatestMillesimeOrFunction } from './datafunctions/005_CreateGetLatestMillesimeOrFunction.ts';
import { CreateGetClosestCountryFunction } from './datafunctions/006_CreateGetClosestCountryFunction.ts';
import { CreateGetClosestComFunction } from './datafunctions/007_CreateGetClosestComFunction.ts';
import { IgnAe2019 } from './datasets/ign/admin_express/2019/IgnAe2019.ts';
import { IgnAe2020 } from './datasets/ign/admin_express/2020/IgnAe2020.ts';
import { IgnAe2021 } from './datasets/ign/admin_express/2021/IgnAe2021.ts';
import { IgnAe2022 } from './datasets/ign/admin_express/2022/IgnAe2022.ts';
import { IgnAe2023 } from './datasets/ign/admin_express/2023/IgnAe2023.ts';
import { EurostatCountries2020 } from './datasets/eurostat/countries/2020/EurostatCountries2020.ts';
import { EurostatSimplifiedCountries2020 } from './datasets/eurostat/countries/2020/EurostatSimplifiedCountries2020.ts';
import { InseePerim2019 } from './datasets/insee/perimetres/2019/InseePerim2019.ts';
import { InseePerim2020 } from './datasets/insee/perimetres/2020/InseePerim2020.ts';
import { InseePerim2021 } from './datasets/insee/perimetres/2021/InseePerim2021.ts';
import { InseePerim2022 } from './datasets/insee/perimetres/2022/InseePerim2022.ts';
import { InseePerim2023 } from './datasets/insee/perimetres/2023/InseePerim2023.ts';
import { InseeDep2021 } from './datasets/insee/departements/2021/InseeDep2021.ts';
import { InseeDep2022 } from './datasets/insee/departements/2022/InseeDep2022.ts';
import { InseeDep2023 } from './datasets/insee/departements/2023/InseeDep2023.ts';
import { InseeReg2021 } from './datasets/insee/regions/2021/InseeReg2021.ts';
import { InseeReg2022 } from './datasets/insee/regions/2022/InseeReg2022.ts';
import { InseeReg2023 } from './datasets/insee/regions/2023/InseeReg2023.ts';
import { InseePays2021 } from './datasets/insee/pays/2021/InseePays2021.ts';
import { InseePays2022 } from './datasets/insee/pays/2022/InseePays2022.ts';
import { InseePays2023 } from './datasets/insee/pays/2023/InseePays2023.ts';
import { CeremaAom2019 } from './datasets/cerema/aom/2019/CeremaAom2019.ts';
import { CeremaAom2020 } from './datasets/cerema/aom/2020/CeremaAom2020.ts';
import { CeremaAom2021 } from './datasets/cerema/aom/2021/CeremaAom2021.ts';
import { CeremaAom2022 } from './datasets/cerema/aom/2022/CeremaAom2022.ts';
import { CeremaAom2023 } from './datasets/cerema/aom/2023/CeremaAom2023.ts';
import { DgclBanatic2022 } from './datasets/dgcl/banatic/2022/DgclBanatic2022.ts';
import { DgclBanatic2023 } from './datasets/dgcl/banatic/2023/DgclBanatic2023.ts';
import { InseeMvtcom2021 } from './datasets/insee/mvt_communaux/2021/InseeMvtcom2021.ts';
import { InseeMvtcom2022 } from './datasets/insee/mvt_communaux/2022/InseeMvtcom2022.ts';
import { InseeMvtcom2023 } from './datasets/insee/mvt_communaux/2023/InseeMvtcom2023.ts';
import { StaticAbstractDataset, StaticMigrable } from './interfaces/index.ts';
import { InseeCom2021 } from './datasets/insee/communes/2021/InseeCom2021.ts';
import { InseeCom2022 } from './datasets/insee/communes/2022/InseeCom2022.ts';
import { InseeCom2023 } from './datasets/insee/communes/2023/InseeCom2023.ts';
import { PopulateGeoCentroid } from './datatreatments/PopulateGeoCentroid.ts';

export {
  CreateGeoTable,
  CreateComEvolutionTable,
  CreateGeoCentroidTable,
  CreateGetLatestByPointFunction,
  CreateGetByPointFunction,
  CreateGetLatestByCodeFunction,
  CreateGetByCodeFunction,
  CreateGetLatestMillesimeFunction,
  CreateGetLatestMillesimeOrFunction,
  CreateGetClosestCountryFunction,
  CreateGetClosestComFunction,
  IgnAe2019,
  IgnAe2020,
  IgnAe2021,
  IgnAe2022,
  IgnAe2023,
  EurostatCountries2020,
  EurostatSimplifiedCountries2020,
  InseeCom2021,
  InseeCom2022,
  InseeCom2023,
  InseePerim2019,
  InseePerim2020,
  InseePerim2021,
  InseePerim2022,
  InseePerim2023,
  InseeDep2021,
  InseeDep2022,
  InseeDep2023,
  InseeReg2021,
  InseeReg2022,
  InseeReg2023,
  InseePays2021,
  InseePays2022,
  InseePays2023,
  CeremaAom2019,
  CeremaAom2020,
  CeremaAom2021,
  CeremaAom2022,
  CeremaAom2023,
  DgclBanatic2022,
  DgclBanatic2023,
  InseeMvtcom2021,
  InseeMvtcom2022,
  InseeMvtcom2023,
  PopulateGeoCentroid,
};

export const datastructures: Set<StaticMigrable> = new Set([
  CreateGeoTable,
  CreateComEvolutionTable,
  CreateGeoCentroidTable,
  CreateGetLatestByPointFunction,
  CreateGetByPointFunction,
  CreateGetLatestByCodeFunction,
  CreateGetByCodeFunction,
  CreateGetLatestMillesimeFunction,
  CreateGetLatestMillesimeOrFunction,
  CreateGetClosestCountryFunction,
  CreateGetClosestComFunction,
  PopulateGeoCentroid,
]);

export const datasets: Set<StaticAbstractDataset> = new Set([
  IgnAe2019,
  IgnAe2020,
  IgnAe2021,
  IgnAe2022,
  IgnAe2023,
  EurostatCountries2020,
  EurostatSimplifiedCountries2020,
  InseeCom2021,
  InseeCom2022,
  InseeCom2023,
  InseePerim2019,
  InseePerim2020,
  InseePerim2021,
  InseePerim2022,
  InseePerim2023,
  InseeDep2021,
  InseeDep2022,
  InseeDep2023,
  InseeReg2021,
  InseeReg2022,
  InseeReg2023,
  InseePays2021,
  InseePays2022,
  InseePays2023,
  CeremaAom2019,
  CeremaAom2020,
  CeremaAom2021,
  CeremaAom2022,
  CeremaAom2023,
  DgclBanatic2022,
  DgclBanatic2023,
  InseeMvtcom2021,
  InseeMvtcom2022,
  InseeMvtcom2023,
]);

import { CreateGeoTable } from './datastructure/000_CreateGeoTable.js';
import { CreateComEvolutionTable } from './datastructure/001_CreateComEvolutionTable.js';
import { CreateGeoCentroidTable } from './datastructure/002_CreateGeoCentroidTable.js';
import { CreateGetLatestByPointFunction } from './datafunctions/000_CreateGetLatestByPointFunction.js';
import { CreateGetByPointFunction } from './datafunctions/001_CreateGetByPointFunction.js';
import { CreateGetLatestByCodeFunction } from './datafunctions/002_CreateGetLatestByCodeFunction.js';
import { CreateGetByCodeFunction } from './datafunctions/003_CreateGetByCodeFunction.js';
import { CreateGetLatestMillesimeFunction } from './datafunctions/004_CreateGetLatestMillesimeFunction.js';
import { CreateGetLatestMillesimeOrFunction } from './datafunctions/005_CreateGetLatestMillesimeOrFunction.js';
import { CreateGetClosestCountryFunction } from './datafunctions/006_CreateGetClosestCountryFunction.js';
import { CreateGetClosestComFunction } from './datafunctions/007_CreateGetClosestComFunction.js';
import { IgnAe2019 } from './datasets/ign/admin_express/2019/IgnAe2019.js';
import { IgnAe2020 } from './datasets/ign/admin_express/2020/IgnAe2020.js';
import { IgnAe2021 } from './datasets/ign/admin_express/2021/IgnAe2021.js';
import { IgnAe2022 } from './datasets/ign/admin_express/2022/IgnAe2022.js';
import { IgnAe2023 } from './datasets/ign/admin_express/2023/IgnAe2023.js';
import { EurostatCountries2020 } from './datasets/eurostat/countries/2020/EurostatCountries2020.js';
import { EurostatSimplifiedCountries2020 } from './datasets/eurostat/countries/2020/EurostatSimplifiedCountries2020.js';
import { InseePerim2019 } from './datasets/insee/perimetres/2019/InseePerim2019.js';
import { InseePerim2020 } from './datasets/insee/perimetres/2020/InseePerim2020.js';
import { InseePerim2021 } from './datasets/insee/perimetres/2021/InseePerim2021.js';
import { InseePerim2022 } from './datasets/insee/perimetres/2022/InseePerim2022.js';
import { InseePerim2023 } from './datasets/insee/perimetres/2023/InseePerim2023.js';
import { InseeDep2021 } from './datasets/insee/departements/2021/InseeDep2021.js';
import { InseeDep2022 } from './datasets/insee/departements/2022/InseeDep2022.js';
import { InseeDep2023 } from './datasets/insee/departements/2023/InseeDep2023.js';
import { InseeReg2021 } from './datasets/insee/regions/2021/InseeReg2021.js';
import { InseeReg2022 } from './datasets/insee/regions/2022/InseeReg2022.js';
import { InseeReg2023 } from './datasets/insee/regions/2023/InseeReg2023.js';
import { InseePays2021 } from './datasets/insee/pays/2021/InseePays2021.js';
import { InseePays2022 } from './datasets/insee/pays/2022/InseePays2022.js';
import { InseePays2023 } from './datasets/insee/pays/2023/InseePays2023.js';
import { CeremaAom2019 } from './datasets/cerema/aom/2019/CeremaAom2019.js';
import { CeremaAom2020 } from './datasets/cerema/aom/2020/CeremaAom2020.js';
import { CeremaAom2021 } from './datasets/cerema/aom/2021/CeremaAom2021.js';
import { CeremaAom2022 } from './datasets/cerema/aom/2022/CeremaAom2022.js';
import { CeremaAom2023 } from './datasets/cerema/aom/2023/CeremaAom2023.js';
import { DgclBanatic2022 } from './datasets/dgcl/banatic/2022/DgclBanatic2022.js';
import { DgclBanatic2023 } from './datasets/dgcl/banatic/2023/DgclBanatic2023.js';
import { InseeMvtcom2021 } from './datasets/insee/mvt_communaux/2021/InseeMvtcom2021.js';
import { InseeMvtcom2022 } from './datasets/insee/mvt_communaux/2022/InseeMvtcom2022.js';
import { InseeMvtcom2023 } from './datasets/insee/mvt_communaux/2023/InseeMvtcom2023.js';
import { StaticAbstractDataset, StaticMigrable } from './interfaces/index.js';
import { InseeCom2021 } from './datasets/insee/communes/2021/InseeCom2021.js';
import { InseeCom2022 } from './datasets/insee/communes/2022/InseeCom2022.js';
import { InseeCom2023 } from './datasets/insee/communes/2023/InseeCom2023.js';
import { PopulateGeoCentroid } from './datatreatments/PopulateGeoCentroid.js';

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

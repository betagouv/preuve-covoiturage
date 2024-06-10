import { DgclBanaticDataset } from "../common/DgclBanaticDataset.ts";
import {
  FileTypeEnum,
  StateManagerInterface,
} from "../../../../interfaces/index.ts";
import { CeremaAom2022 } from "../../../../datasets.ts";

export class DgclBanatic2022 extends DgclBanaticDataset {
  static producer = "dgcl";
  static dataset = "banatic";
  static year = 2022;
  static table = "dgcl_banatic_2022";
  static url =
    // eslint-disable-next-line max-len
    "https://www.banatic.interieur.gouv.fr/V5/fichiers-en-telechargement/telecharger.php?zone=N&date=01/01/2022&format=C";

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  sheetOptions = {
    name: "Sheet1",
    startRow: 0,
  };

  async validate(state: StateManagerInterface) {
    state.plan([CeremaAom2022]);
  }

  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_aom = t.nom, aom = t.siren
    FROM (
      SELECT distinct a.com, b.siren, b.nom
      FROM ${this.targetSchema}.${CeremaAom2022.table} AS a
      JOIN ${this.tableWithSchema} AS b
      ON a.siren_group = b.siren
      WHERE a.siren_aom is null AND b.competence is true
    ) t
    WHERE  a.com = t.com AND a.year = 2022;
  `;
  /* Attribution des code aom région (identique au code siren de la région) pour les communes
  n'ayant pas pris la compétence  !!! Attention, il y a plusieurs erreurs dans le fichier source
  CeremaAom2022: les codes régions ont été attribués en tant que code aom mais parfois les codes ne
  coincident pas. Les erreurs sont corrigés en remplaçant les codes aom des valeurs nulles
  ou <= à 2 caractères via la requête ci-dessous */
  readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET 
      aom = CASE WHEN reg = '84' THEN '200053767'
        WHEN reg = '27' THEN '200053726'
        WHEN reg = '53' THEN '233500016'
        WHEN reg = '24' THEN '234500023'
        WHEN reg = '94' THEN '232000018'
        WHEN reg = '44' THEN '200052264'
        WHEN reg = '32' THEN '200053742'
        WHEN reg = '11' THEN '237500079'
        WHEN reg = '28' THEN '200053403'
        WHEN reg = '75' THEN '200053759'
        WHEN reg = '76' THEN '200053791'
        WHEN reg = '52' THEN '234400034'
        WHEN reg = '93' THEN '231300021'
        WHEN reg = '01' THEN '239710015'
        WHEN reg = '02' THEN '239720014'
        WHEN reg = '03' THEN '239730013'
        WHEN reg = '04' THEN '239740012'
        WHEN reg = '06' THEN '229850003'
      END,
      l_aom = l_reg
    WHERE (length(aom) <= 2 OR aom IS NULL)
    AND year = 2022;
  `;
}

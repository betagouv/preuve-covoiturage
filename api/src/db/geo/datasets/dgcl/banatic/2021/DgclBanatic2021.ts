import { CeremaAom2021 } from "../../../../datasets.ts";
import { FileTypeEnum, StateManagerInterface } from "../../../../interfaces/index.ts";
import { DgclBanaticDataset } from "../common/DgclBanaticDataset.ts";

// This file is no longer available
// For archive only
export class DgclBanatic2021 extends DgclBanaticDataset {
  static producer = "dgcl";
  static dataset = "banatic";
  static year = 2021;
  static table = "dgcl_banatic_2021";
  static url = "https://geo-datasets-archives.s3.fr-par.scw.cloud/dgcl_banatic_2021.csv";
  static sha256 = "31681db2273802244d608b5701756a1e1ca70da30b42b68115a4bb682baf28a2";

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  override sheetOptions = {
    name: "Sheet1",
    startRow: 0,
  };

  override async validate(state: StateManagerInterface) {
    state.plan([CeremaAom2021]);
  }

  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_aom = t.nom, aom = t.siren
    FROM (
      SELECT distinct a.com, b.siren, b.nom
      FROM ${this.targetSchema}.${CeremaAom2021.table} AS a
      JOIN ${this.tableWithSchema} AS b
      ON a.siren_group = b.siren
      WHERE a.siren_aom is null AND b.competence is true
    ) t
    WHERE  a.com = t.com AND a.year = 2021;
  `;
  /* Attribution des code aom région (identique au code siren de la région) pour les communes
  n'ayant pas pris la compétence */
  override readonly extraImportSql = `
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
    WHERE aom is null AND year = 2021;
  `;
}

import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { CeremaAom2024 } from "../../../../datasets.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StateManagerInterface } from "../../../../interfaces/index.ts";

export class DgclBanatic2024 extends AbstractDataset {
  static producer = "dgcl";
  static dataset = "banatic";
  static year = 2024;
  static table = "dgcl_banatic_2024";
  static url = "https://geo-datasets-archives.s3.fr-par.scw.cloud/dgcl_banatic_2024.csv";
  static sha256 = "a46bb5c04e54c7bde6e519416de2703293d3352a08036351c64c595afb9c1335";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly fileType: FileTypeEnum = FileTypeEnum.Csv;

  /**
   * La nomenclature de la compétence a été modifiée en 2024, c'est maintenant :
   * 6000 - Organisation de services réguliers / à la demande de transports publics de personnes, des services de mobilité solidaire, organisation ou contribution au développement des services relatifs aux mobilités actives définies à l'article L. 1271-1 du code des transports, organisation ou contribution au développement des services relatifs aux usages partagés des véhicules terrestres à moteur.
   */
  readonly rows: Map<string, [string, string]> = new Map([
    ["siren", ["0", "varchar"]],
    ["nom", ["1", "varchar"]],
    ["nature", ["2", "varchar"]],
    ["date_creation", ["3", "varchar"]],
    ["date_effet", ["4", "varchar"]],
    ["competence", ["5", "boolean"]],
  ]);

  override async validate(state: StateManagerInterface) {
    state.plan([CeremaAom2024]);
  }

  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_aom = t.nom, aom = t.siren
    FROM (
      SELECT distinct a.com, b.siren, b.nom
      FROM ${this.targetSchema}.${CeremaAom2024.table} AS a
      JOIN ${this.tableWithSchema} AS b
      ON a.siren_group = b.siren
      WHERE a.siren_aom is null AND b.competence is true
    ) t
    WHERE  a.com = t.com AND a.year = 2024;
  `;

  /**
   * Attribution des code aom région (identique au code SIREN de la région) pour
   * les communes n'ayant pas pris la compétence
   *
   * !!! Attention, il y a plusieurs erreurs dans le fichier source
   * CeremaAom2024: les codes régions ont été attribués en tant que code aom
   * mais parfois les codes ne coincident pas. Les erreurs sont corrigés en
   * remplaçant les codes aom des valeurs nulles ou <= à 2 caractères via la
   * requête ci-dessous
   */
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
    AND year = 2024;
  `;
}

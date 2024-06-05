import { AbstractDataset } from '../../../../common/AbstractDataset.ts';
import { ArchiveFileTypeEnum, FileTypeEnum } from '../../../../interfaces/index.ts';

export class CeremaAom2022 extends AbstractDataset {
  static producer = 'cerema';
  static dataset = 'aom';
  static year = 2022;
  static table = 'cerema_aom_2022';
  static url = 'http://www.cerema.fr/system/files/documents/2022/09/base_rt_2022_diffusion.ods';

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ['id_reseau', ['Id réseau', 'integer']],
    ['nom_reseau', ['Nom du réseau', 'varchar']],
    ['siren_aom', ['N° SIREN AOM', 'varchar']],
    ['nom_aom', ['Nom de l’AOM', 'varchar']],
    ['forme_juridique_aom', ['Forme juridique de l’AOM', 'varchar']],
    ['region', ['Région siège', 'varchar']],
    ['departement', ['Département siège', 'varchar']],
    ['siren_group', ['N° SIREN groupement', 'varchar']],
    ['lien_banatic', ['Lien Banatic', 'varchar']],
    ['nom_group', ['Nom du groupement', 'varchar']],
    ['forme_juridique_group', ['Nature juridique du groupement', 'varchar']],
    ['nb_membres', ['Nombre de membres', 'varchar']],
    ['pop_aom_2018', ['Population  totale 2018', 'varchar']],
    ['nom_membre', ['Nom membre', 'varchar']],
    ['pop_banatic_2018', ['Population  totale 2018 (Banatic)', 'varchar']],
    ['siren_membre', ['Siren membre', 'varchar']],
    ['com', ['N° INSEE', 'varchar']],
    ['wikipedia', ['Lien Page wikipedia', 'varchar']],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  sheetOptions = {
    name: 'RT_2022_-_Composition_communale',
    startRow: 0,
  };

  readonly tableIndex = 'com';
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = t.siren_aom::integer,
      l_aom = t.nom_aom,
      reseau = t.id_reseau::integer,
      l_reseau = t.nom_reseau
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2022;
  `;
}

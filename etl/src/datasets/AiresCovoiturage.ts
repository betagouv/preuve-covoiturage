import { AbstractDataset, ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from '@betagouvpdc/evolution-geo';

export function AiresCovoiturage(year: number, url: string): StaticAbstractDataset {
  return class extends AbstractDataset {
    static producer = 'transport_data_gouv';
    static dataset = 'aires_covoiturage';
    static year = year;
    static url = url;
    static table = `aires_covoiturage_${year}`;
    readonly targetTable = 'aires_covoiturage';
    readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
    readonly rows: Map<string, [string, string]> = new Map([
      ['id_lieu', ['id_lieu', 'varchar']],
      ['nom_lieu', ['nom_lieu', 'varchar']],
      ['ad_lieu', ['ad_lieu', 'varchar']],
      ['com_lieu', ['com_lieu', 'varchar']],
      ['insee', ['insee', 'varchar']],
      ['type', ['type', 'varchar']],
      ['date_maj', ['date_maj', 'date']],
      ['ouvert', ['ouvert', 'boolean']],
      ['source', ['source', 'varchar']],
      ['xlong', ['Xlong', 'varchar']],
      ['ylat', ['Ylat', 'varchar']],
      ['nbre_pl', ['nbre_pl', 'varchar']],
      ['nbre_pmr', ['nbre_pmr', 'varchar']],
      ['duree', ['duree', 'varchar']],
      ['horaires', ['horaires', 'varchar']],
      ['proprio', ['proprio', 'varchar']],
      ['lumiere', ['lumiere', 'varchar']],
      ['comm', ['comm', 'varchar']],
    ]);
    fileType: FileTypeEnum = FileTypeEnum.Csv;
    sheetOptions = {
      delimiter: ',',
      columns: true,
    };

    readonly importSql = `
      INSERT INTO ${this.targetTableWithSchema} (
        id_lieu,
        nom_lieu,
        ad_lieu,
        com_lieu,
        insee,
        type,
        date_maj,
        ouvert,
        source,
        xlong,
        ylat,
        nbre_pl,
        nbre_pmr,
        duree,
        horaires,
        proprio,
        lumiere,
        comm,
        geom
      ) SELECT
        id_lieu,
        nom_lieu,
        ad_lieu,
        com_lieu,
        insee,
        type,
        date_maj,
        ouvert,
        source,
        xlong,
        ylat,
        nbre_pl,
        nbre_pmr,
        duree,
        horaires,
        proprio,
        lumiere,
        comm,
        ST_SetSRID(ST_Point(trim(xlong,chr(160))::float,trim(ylat,chr(160))::float),4326)
      FROM ${this.tableWithSchema} 
      ON CONFLICT 
      ON CONSTRAINT ${this.targetTable}_id_lieu_key
      DO NOTHING;
    `;
  };
}
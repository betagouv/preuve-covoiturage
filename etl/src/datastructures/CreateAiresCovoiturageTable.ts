import { AbstractDatastructure } from '@betagouvpdc/evolution-geo';

export class CreateAiresCovoiturageTable extends AbstractDatastructure {
  static uuid = 'create_aires_covoiturage_table';
  static table = 'aires_covoiturage';
  static year = 2023;
  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');
  readonly sql = `
      DROP TABLE IF EXISTS ${this.tableWithSchema};
      CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
        id SERIAL PRIMARY KEY,
        id_lieu varchar UNIQUE,
        nom_lieu varchar,
        ad_lieu varchar,
        com_lieu varchar,
        insee varchar,
        type varchar,
        date_maj date,
        ouvert boolean,
        source varchar,
        xlong varchar,
        ylat varchar,
        nbre_pl varchar,
        nbre_pmr varchar,
        duree varchar,
        horaires varchar,
        proprio varchar,
        lumiere varchar,
        comm varchar,
        geom geometry(POINT,4326),
        created_at TIMESTAMP(0) NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index ON ${this.tableWithSchema} USING btree (id);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_index ON ${this.tableWithSchema} USING gist (geom);
    `;
}

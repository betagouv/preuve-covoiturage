import { AbstractDatastructure } from '@betagouvpdc/evolution-geo';

export class CreateIncentiveCampaignsTable extends AbstractDatastructure {
  static uuid = 'create_incentive_campaigns_table';
  static table = 'incentive_campaigns';
  static year = 2024;
  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');
  readonly sql = `
      DROP TABLE IF EXISTS ${this.tableWithSchema};
      CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
        id SERIAL PRIMARY KEY,
        collectivite varchar,
        derniere_maj varchar,
        email	varchar,
        siret	varchar,
        premiere_campagne	varchar,
        budget_incitations varchar,
        date_debut varchar,
        date_fin varchar,
        conducteur_montant_max_par_passager varchar,
        conducteur_montant_max_par_mois varchar,
        conducteur_montant_min_par_passager varchar,
        conducteur_trajets_max_par_mois varchar,
        passager_trajets_max_par_mois varchar,
        passager_gratuite varchar,
        passager_eligible_gratuite varchar,
        passager_reduction_ticket varchar,
        passager_eligibilite_reduction varchar,
        passager_montant_ticket varchar,
        zone_sens_des_trajets varchar,
        zone_exclusion varchar,
        si_zone_exclue_liste varchar,
        autre_exclusion varchar,
        trajet_longueur_min varchar,
        trajet_longueur_max varchar,
        trajet_classe_de_preuve varchar,
        operateurs varchar,
        autres_informations varchar
      );
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index ON ${this.tableWithSchema} USING btree (id);
    `;
}
import { AbstractDataset, ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from '@betagouvpdc/evolution-geo';

export function IncentiveCampaigns(url: string): StaticAbstractDataset {
  return class extends AbstractDataset {
    static producer = 'data_gouv';
    static dataset = 'incentive_campaigns';
    static year = 2024;
    static url = url;
    static skipStatePersistence = true;
    static table = `incentive_campaigns_temp`;
    readonly targetTable = 'incentive_campaigns';
    readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
    readonly rows: Map<string, [string, string]> = new Map([
      ['collectivite', ['collectivite', 'varchar']],
      ['derniere_maj', ['derniere_maj', 'varchar']],
      ['email', ['email', 'varchar']],
      ['siret', ['siret', 'varchar']],
      ['premiere_campagne', ['premiere_campagne', 'varchar']],
      ['budget_incitations', ['budget_incitations', 'varchar']],
      ['date_debut', ['date_debut', 'varchar']],
      ['date_fin', ['date_fin', 'varchar']],
      ['conducteur_montant_max_par_passager', ['conducteur_montant_max_par_passager', 'varchar']],
      ['conducteur_montant_max_par_mois', ['conducteur_montant_max_par_mois', 'varchar']],
      ['conducteur_montant_min_par_passager', ['conducteur_montant_min_par_passager', 'varchar']],
      ['conducteur_trajets_max par_mois', ['conducteur_trajets_max_par_mois', 'varchar']],
      ['passager_trajets_max_par_mois', ['passager_trajets_max_par_mois', 'varchar']],
      ['passager_gratuite', ['passager_gratuite', 'varchar']],
      ['passager_eligible_gratuite', ['passager_eligible_gratuite', 'varchar']],
      ['passager_reduction_ticket', ['passager_reduction_ticket', 'varchar']],
      ['passager_eligibilite_reduction', ['passager_eligibilite_reduction', 'varchar']],
      ['passager_montant_ticket', ['passager_montant_ticket', 'varchar']],
      ['zone_sens_des_trajets', ['zone_sens_des_trajets', 'varchar']],
      ['zone_exclusion', ['zone_exclusion', 'varchar']],
      ['si_zone_exclue_liste', ['si_zone_exclue_liste', 'varchar']],
      ['autre_exclusion', ['autre_exclusion', 'varchar']],
      ['trajet_longueur_min', ['trajet_longueur_min', 'varchar']],
      ['trajet_longueur_max', ['trajet_longueur_max', 'varchar']],
      ['trajet_classe_de_preuve', ['trajet_classe_de_preuve', 'varchar']],
      ['operateurs', ['operateurs', 'varchar']],
      ['autres_informations', ['autres_informations', 'varchar']],
    ]);
    fileType: FileTypeEnum = FileTypeEnum.Csv;
    sheetOptions = {
      delimiter: ',',
      columns: true,
    };

    readonly importSql = `
      INSERT INTO ${this.targetTableWithSchema} (
        collectivite,
        derniere_maj,
        email,
        siret,
        premiere_campagne,
        budget_incitations,
        date_debut,
        date_fin,
        conducteur_montant_max_par_passager,
        conducteur_montant_max_par_mois,
        conducteur_montant_min_par_passager,
        conducteur_trajets_max par_mois,
        passager_trajets_max_par_mois,
        passager_gratuite,
        passager_eligible_gratuite,
        passager_reduction_ticket,
        passager_eligibilite_reduction,
        passager_montant_ticket,
        zone_sens_des_trajets,
        zone_exclusion,
        si_zone_exclue_liste,
        autre_exclusion,
        trajet_longueur_min,
        trajet_longueur_max,
        trajet_classe_de_preuve,
        operateurs,
        autres_informations
      ) SELECT
        *
      FROM ${this.tableWithSchema} 
      ON CONFLICT
      DO NOTHING;
    `;
  };
}
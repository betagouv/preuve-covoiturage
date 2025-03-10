import { AbstractDataset, ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../geo/index.ts";

export function IncentiveCampaigns(url: string): StaticAbstractDataset {
  return class extends AbstractDataset {
    static producer = "datagouv";
    static dataset = "incentive_campaigns";
    static year = 2024;
    static url = url;
    static sha256 = undefined;
    static filename = undefined;
    static table = `incentive_campaigns_temp`;
    static skipStatePersistence = true;
    readonly targetTable = "incentive_campaigns";
    readonly fileArchiveType = "NONE" as ArchiveFileTypeEnum.None;
    readonly rows: Map<string, [string, string]> = new Map([
      ["collectivite", ["collectivite", "varchar"]],
      ["derniere_maj", ["derniere_maj", "varchar"]],
      ["email", ["email", "varchar"]],
      ["type", ["type", "varchar"]],
      ["code", ["code", "varchar"]],
      ["premiere_campagne", ["premiere_campagne", "varchar"]],
      ["budget_incitations", ["budget_incitations", "varchar"]],
      ["date_debut", ["date_debut", "varchar"]],
      ["date_fin", ["date_fin", "varchar"]],
      ["conducteur_montant_max_par_passager", [
        "conducteur_montant_max_par_passager",
        "varchar",
      ]],
      ["conducteur_montant_max_par_mois", [
        "conducteur_montant_max_par_mois",
        "varchar",
      ]],
      ["conducteur_montant_min_par_passager", [
        "conducteur_montant_min_par_passager",
        "varchar",
      ]],
      ["conducteur_trajets_max_par_mois", [
        "conducteur_trajets_max_par_mois",
        "varchar",
      ]],
      ["passager_trajets_max_par_mois", [
        "passager_trajets_max_par_mois",
        "varchar",
      ]],
      ["passager_gratuite", ["passager_gratuite", "varchar"]],
      ["passager_eligible_gratuite", ["passager_eligible_gratuite", "varchar"]],
      ["passager_reduction_ticket", ["passager_reduction_ticket", "varchar"]],
      ["passager_eligibilite_reduction", [
        "passager_eligibilite_reduction",
        "varchar",
      ]],
      ["passager_montant_ticket", ["passager_montant_ticket", "varchar"]],
      ["zone_sens_des_trajets", ["zone_sens_des_trajets", "varchar"]],
      ["zone_exclusion", ["zone_exclusion", "varchar"]],
      ["si_zone_exclue_liste", ["si_zone_exclue_liste", "varchar"]],
      ["autre_exclusion", ["autre_exclusion", "varchar"]],
      ["trajet_longueur_min", ["trajet_longueur_min", "varchar"]],
      ["trajet_longueur_max", ["trajet_longueur_max", "varchar"]],
      ["trajet_classe_de_preuve", ["trajet_classe_de_preuve", "varchar"]],
      ["operateurs", ["operateurs", "varchar"]],
      ["autres_informations", ["autres_informations", "varchar"]],
      ["zone_sens_des_trajets_litteral", [
        "zone_sens_des_trajets_litteral",
        "varchar",
      ]],
      ["lien", ["lien_page_collectivité", "varchar"]],
      ["nom_plateforme", ["nom_plateforme", "varchar"]],
    ]);
    fileType = "CSV" as FileTypeEnum.Csv;
    sheetOptions = {
      delimiter: ",",
      columns: true,
    };
    readonly importSql = `
      TRUNCATE ${this.targetTableWithSchema} RESTART IDENTITY;
      INSERT INTO ${this.targetTableWithSchema} (
        collectivite,
        derniere_maj,
        email,
        type,
        code,
        premiere_campagne,
        budget_incitations,
        date_debut,
        date_fin,
        conducteur_montant_max_par_passager,
        conducteur_montant_max_par_mois,
        conducteur_montant_min_par_passager,
        conducteur_trajets_max_par_mois,
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
        autres_informations,
        zone_sens_des_trajets_litteral,
        lien,
        nom_plateforme
      ) SELECT
        collectivite,
        derniere_maj,
        email,
        type,
        code,
        premiere_campagne,
        budget_incitations,
        date_debut,
        date_fin,
        conducteur_montant_max_par_passager,
        conducteur_montant_max_par_mois,
        conducteur_montant_min_par_passager,
        conducteur_trajets_max_par_mois,
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
        autres_informations,
        zone_sens_des_trajets_litteral,
        lien,
        nom_plateforme
      FROM ${this.tableWithSchema};
    `;
  };
}

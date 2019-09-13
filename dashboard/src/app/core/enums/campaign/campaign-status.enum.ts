export enum CampaignStatusEnum {
  DRAFT = 'draft',
  PENDING = 'pending',
  VALIDATED = 'validated',
  ARCHIVED = 'archived',
  TEMPLATE = 'template',
}

export const CAMPAIGN_STATUS: CampaignStatusEnum[] = Object.values(CampaignStatusEnum);

export const CAMPAIGN_STATUS_FR = {
  draft: 'Brouillon',
  pending: "En cours d'activation",
  validated: 'En cours',
  archived: 'Archivée',
  template: 'Terminée',
};

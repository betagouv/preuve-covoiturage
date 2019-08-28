export enum CampaignStatusEnum {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  ARCHIVED = 'archived',
  TEMPLATE = 'template',
}

export const CAMPAIGN_STATUS: CampaignStatusEnum[] = Object.values(CampaignStatusEnum);

export const CAMPAIGN_STATUS_FR = {
  draft: 'Brouillon',
  validated: 'En cours',
  archived: 'Archivée',
  template: 'Terminée',
};

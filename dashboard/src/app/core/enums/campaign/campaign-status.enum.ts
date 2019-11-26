export enum CampaignStatusEnum {
  DRAFT = 'draft',
  PENDING = 'pending',
  VALIDATED = 'active',
  ARCHIVED = 'archived',
  TEMPLATE = 'template',
}

export const CAMPAIGN_STATUS: CampaignStatusEnum[] = Object.values(CampaignStatusEnum);

export const CAMPAIGN_STATUS_FR = {
  [CampaignStatusEnum.DRAFT]: 'Brouillon',
  [CampaignStatusEnum.PENDING]: "En cours d'activation",
  [CampaignStatusEnum.VALIDATED]: 'En cours',
  [CampaignStatusEnum.ARCHIVED]: 'Archivée',
  [CampaignStatusEnum.TEMPLATE]: 'Terminée',
};

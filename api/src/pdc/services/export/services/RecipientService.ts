import { KernelInterfaceResolver, provider } from '@ilos/common/index.ts';
import { ExportRecipient } from '../models/ExportRecipient.ts';

export type RecipientServiceInterface = {
  maybeAddCreator(recipients: ExportRecipient[], created_by: number): Promise<ExportRecipient[]>;
};

export abstract class RecipientServiceInterfaceResolver implements RecipientServiceInterface {
  public maybeAddCreator(recipients: ExportRecipient[], created_by: number): Promise<ExportRecipient[]> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: RecipientServiceInterfaceResolver,
})
export class RecipientService {
  constructor(protected kernel: KernelInterfaceResolver) {}

  // add the creator as recipient if no recipient is provided
  public async maybeAddCreator(recipients: ExportRecipient[], created_by: number): Promise<ExportRecipient[]> {
    if (recipients.length) return recipients;

    try {
      const creator = await this.kernel.call(
        'user:find',
        { _id: created_by },
        {
          call: { user: { permissions: ['registry.user.find'] } },
          channel: { service: 'export' },
        },
      );

      return creator ? [ExportRecipient.fromEmail(`${creator.firstname} ${creator.lastname} <${creator.email}>`)] : [];
    } catch (e) {
      console.error(`[RecipientService:maybeAddCreator] Error while fetching creator_id ${created_by}: ${e.message}`);
      return [];
    }
  }
}

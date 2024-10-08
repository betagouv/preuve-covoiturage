import { KernelInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { ExportRecipient } from "../models/ExportRecipient.ts";

export abstract class RecipientServiceInterfaceResolver {
  /**
   * Add the creator as recipient if no recipient is provided
   *
   * @todo check the evolution of the user's service
   *
   * @param {ExportRecipient[]} recipients
   * @param {number} created_by
   * @returns {Promise<ExportRecipient[]>}
   */
  public maybeAddCreator(
    recipients: ExportRecipient[],
    created_by: number,
  ): Promise<ExportRecipient[]> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: RecipientServiceInterfaceResolver,
})
export class RecipientService {
  constructor(protected kernel: KernelInterfaceResolver) {}

  public async maybeAddCreator(
    recipients: ExportRecipient[],
    created_by: number,
  ): Promise<ExportRecipient[]> {
    if (recipients.length) return recipients;

    try {
      const creator = await this.kernel.call(
        "user:find",
        { _id: created_by },
        {
          call: { user: { permissions: ["registry.user.find"] } },
          channel: { service: "export" },
        },
      );

      return creator
        ? [
          ExportRecipient.fromEmail(
            `${creator.firstname} ${creator.lastname} <${creator.email}>`,
          ),
        ]
        : [];
    } catch (e) {
      logger.error(
        `[RecipientService:maybeAddCreator] Error while fetching creator_id ${created_by}: ${e.message}`,
      );
      return [];
    }
  }
}

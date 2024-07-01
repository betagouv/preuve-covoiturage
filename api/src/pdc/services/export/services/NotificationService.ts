import { provider } from "@/ilos/common/Decorators.ts";
import { Export } from "@/pdc/services/export/models/Export.ts";

export type NotificationProvider = {
  send(exp: Export, url: string): Promise<void>;
};

export abstract class NotificationProviderResolver
  implements NotificationProvider {
  public async send(exp: Export, url: string): Promise<void> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: NotificationProviderResolver,
})
export class NotificationService {
  public async send(exp: Export, url: string): Promise<void> {
    console.debug({
      message: "Sending notification",
      export: exp,
      url,
    });
  }
}

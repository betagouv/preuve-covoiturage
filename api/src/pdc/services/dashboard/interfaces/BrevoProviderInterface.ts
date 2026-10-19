export interface SendWelcomeEmailParams {
  email: string;
  siret: string;
  login_url: string;
}

export interface BrevoProviderInterface {
  sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void>;
}

export abstract class BrevoProviderInterfaceResolver implements BrevoProviderInterface {
  async sendWelcomeEmail(_params: SendWelcomeEmailParams): Promise<void> {
    throw new Error("Not implemented");
  }
}

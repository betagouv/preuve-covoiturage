export interface AuthRepositoryProviderInterface {
  readonly table: string;

  readonly CONFIRMATION_TOKEN: string;
  readonly INVITATION_TOKEN: string;
  readonly RESET_TOKEN: string;

  readonly CONFIRMED_STATUS: string;
  readonly UNCONFIRMED_STATUS: string;
  readonly INVITED_STATUS: string;

  createTokenByEmail(email: string, type: string, status?: string): Promise<string | undefined>;
  clearTokenByEmail(email: string, status?: string): Promise<boolean>;
  challengePasswordByEmail(email: string, password: string): Promise<boolean>;
  challengePasswordById(_id: string, password: string): Promise<boolean>;
  challengeTokenByEmail(email: string, clearToken: string): Promise<boolean>;
  updatePasswordById(_id: string, password: string): Promise<boolean>;
  updatePasswordByEmail(email: string, password: string, status?: string): Promise<boolean>;
  updateEmailById(id: string, email: string, status?: string): Promise<string>;
}

export abstract class AuthRepositoryProviderInterfaceResolver implements AuthRepositoryProviderInterface {
  readonly table: string;

  readonly CONFIRMATION_TOKEN: string;
  readonly INVITATION_TOKEN: string;
  readonly RESET_TOKEN: string;

  readonly CONFIRMED_STATUS: string;
  readonly UNCONFIRMED_STATUS: string;
  readonly INVITED_STATUS: string;

  async createTokenByEmail(email: string, type: string, status: string = 'pending'): Promise<string | undefined> {
    throw new Error();
  }

  async clearTokenByEmail(email: string, status?: string): Promise<boolean> {
    throw new Error();
  }

  async challengePasswordByEmail(email: string, password: string): Promise<boolean> {
    throw new Error();
  }

  async challengePasswordById(_id: string, password: string): Promise<boolean> {
    throw new Error();
  }

  async challengeTokenByEmail(email: string, clearToken: string): Promise<boolean> {
    throw new Error();
  }

  async updatePasswordById(_id: string, password: string): Promise<boolean> {
    throw new Error();
  }

  async updatePasswordByEmail(email: string, password: string, status?: string): Promise<boolean> {
    throw new Error();
  }

  async updateEmailById(id: string, email: string, status?: string): Promise<string> {
    throw new Error();
  }
}

export interface AuthRepositoryProviderInterface {}

export abstract class AuthRepositoryProviderInterfaceResolver implements AuthRepositoryProviderInterface {
  async challengePasswordById(id: string, password: string): Promise<boolean> {
    throw new Error();
  }
  async challengeTokenByEmail(email: string, token: string): Promise<boolean> {
    throw new Error();
  }
  async challengePasswordByEmail(email: string, password: string): Promise<boolean> {
    throw new Error();
  }
  async createTokenByEmail(email: string, type: string, status?: string): Promise<string> {
    throw new Error();
  }
  async updatePasswordById(id: string, password: string): Promise<boolean> {
    throw new Error();
  }

  async updatePasswordByEmail(email: string, password: string): Promise<boolean> {
    throw new Error();
  }
  async updateEmailById(id: string, email: string): Promise<string> {
    throw new Error();
  }
  async clearTokenByEmail(email: string, status?: string): Promise<boolean> {
    throw new Error();
  }
}

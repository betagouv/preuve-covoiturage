import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

import { bcrypt_compare, bcrypt_hash } from "@/lib/crypto/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import {
  AuthRepositoryProviderInterface,
  AuthRepositoryProviderInterfaceResolver,
} from "../interfaces/AuthRepositoryProviderInterface.ts";

@provider({
  identifier: AuthRepositoryProviderInterfaceResolver,
})
export class AuthRepositoryProvider implements AuthRepositoryProviderInterface {
  public readonly table = "auth.users";

  public readonly CONFIRMATION_TOKEN = "confirmation";
  public readonly INVITATION_TOKEN = "invitation";
  public readonly RESET_TOKEN = "reset";

  public readonly CONFIRMED_STATUS = "active";
  public readonly UNCONFIRMED_STATUS = "pending";
  public readonly INVITED_STATUS = "invited";

  constructor(
    protected connection: PostgresConnection,
    private config: ConfigInterfaceResolver,
  ) {}

  /**
   * Get password from id or undefined if not found
   */
  protected async getPasswordById(_id: number): Promise<string | undefined> {
    const query = {
      text: `
        SELECT
          password
        FROM ${this.table}
        WHERE _id = $1
        LIMIT 1
      `,
      values: [_id],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0].password;
  }

  /**
   * Get password from email or undefined if not found
   */
  protected async getPasswordByEmail(email: string): Promise<string> {
    const query = {
      text: `
        SELECT
          password
        FROM ${this.table}
        WHERE email = $1
        LIMIT 1
      `,
      values: [email],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0].password;
  }

  /**
   * Get token and expires at by email or null if not found
   */
  protected async getTokenByEmail(
    email: string,
  ): Promise<{ token: string | null; token_expires_at: Date | null }> {
    const query = {
      text: `
        SELECT
          token,
          token_expires_at
        FROM ${this.table}
        WHERE email = $1
        LIMIT 1
      `,
      values: [email],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return {
        token: null,
        token_expires_at: null,
      };
    }

    return result.rows[0];
  }

  /**
   * Get expires at from token type, return current date if type not found
   */
  protected getTokenExpiresAt(type: string): Date {
    return new Date(
      new Date().getTime() +
        this.config.get(`user.tokenExpiration.${type}`, 0) * 1000,
    );
  }

  /**
   * Create a token by email, set status to unconfirmed by default, return the token
   */
  async createTokenByEmail(
    email: string,
    type: string,
    status?: string,
  ): Promise<string | undefined> {
    const plainToken = uuidV4();
    const cryptedToken = await bcrypt_hash(plainToken);
    const token_expires_at = this.getTokenExpiresAt(type);

    const values = [email, cryptedToken, token_expires_at];
    const query = {
      text: `
      UPDATE ${this.table}
        SET token = $2,
        token_expires_at = $3::timestamp
        ${status ? ", status = $4" : ""}
      WHERE email = $1
      `,
      values: status ? [...values, status] : values,
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return plainToken;
  }

  /**
   * Clear token by email, can update status if necessary
   */
  async clearTokenByEmail(email: string, status?: string): Promise<boolean> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET token = null, token_expires_at = null
        ${status ? ", status = $2" : ""}
      WHERE email = $1
      `,
      values: [email],
    };

    if (status) {
      query.values.push(status);
    }

    const result = await this.connection.getClient().query<any>(query);

    return result.rowCount > 0;
  }

  /**
   * Challenge password by email
   */
  async challengePasswordByEmail(
    email: string,
    password: string,
  ): Promise<boolean> {
    const hashedPassword = await this.getPasswordByEmail(email);
    if (!hashedPassword) {
      return false;
    }

    return await bcrypt_compare(password, hashedPassword);
  }

  /**
   * Challenge password by id
   */
  async challengePasswordById(_id: number, password: string): Promise<boolean> {
    const hashedPassword = await this.getPasswordById(_id);
    if (!hashedPassword) {
      return false;
    }

    return await bcrypt_compare(password, hashedPassword);
  }

  /**
   * Challenge token by email
   */
  async challengeTokenByEmail(
    email: string,
    clearToken: string,
  ): Promise<boolean> {
    const tokenData = await this.getTokenByEmail(email);
    if (!tokenData) {
      return false;
    }

    const { token, token_expires_at } = tokenData;

    if (
      !token || !(await bcrypt_compare(clearToken, token))
    ) {
      return false;
    }

    if (!token_expires_at || token_expires_at.getTime() - Date.now() < 0) {
      return false;
    }

    return true;
  }

  /**
   * Update password by id
   */
  async updatePasswordById(_id: number, password: string): Promise<boolean> {
    const newHashPassword = await bcrypt_hash(password);

    const query = {
      text: `
      UPDATE ${this.table}
        SET token = null, token_expires_at = null, password = $2
      WHERE _id = $1
      `,
      values: [_id, newHashPassword],
    };

    const result = await this.connection.getClient().query<any>(query);

    return result.rowCount > 0;
  }

  /**
   * Update password by email
   */
  async updatePasswordByEmail(
    email: string,
    password: string,
    status: string = this.UNCONFIRMED_STATUS,
  ): Promise<boolean> {
    const newHashPassword = await bcrypt_hash(password);

    const query = {
      text: `
      UPDATE ${this.table}
        SET token = null,
        token_expires_at = null,
        password = $2,
        status = $3
      WHERE email = $1
      `,
      values: [email, newHashPassword, status],
    };

    const result = await this.connection.getClient().query<any>(query);

    return result.rowCount > 0;
  }

  /**
   * Update email by id, update status
   */
  async updateEmailById(
    _id: number,
    email: string,
    status: string = this.UNCONFIRMED_STATUS,
  ): Promise<string> {
    const clearToken = uuidV4();
    const cryptedToken = await bcrypt_hash(clearToken);
    const token_expires_at = this.getTokenExpiresAt(this.CONFIRMATION_TOKEN);

    const query = {
      text: `
      UPDATE ${this.table}
        SET token = $2,
        token_expires_at = $3::timestamp,
        email = $4,
        status = $5
      WHERE _id = $1
      `,
      values: [_id, cryptedToken, token_expires_at, email, status],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return clearToken;
  }
}

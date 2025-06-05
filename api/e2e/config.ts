import { env } from "./lib/config.ts";

/**
 * Test for legacy authentication with different API versions.
 * @doc https://tech.covoiturage.beta.gouv.fr/
 *
 * UPDATE the list of supported versions if needed.
 * - 2025-05-22: v3, v3.2
 */
export const SUPPORTED_VERSIONS = ["v3", "v3.2"];
export const UNSUPPORTED_VERSIONS = ["v3.1", "v4"];

export const USER_ACCESSKEY = env("APIE2E_AUTH_ACCESSKEY");
export const USER_SECRETKEY = env("APIE2E_AUTH_SECRETKEY");
export const OPERATOR_EMAIL = env("APIE2E_AUTH_OPERATOR_EMAIL");
export const OPERATOR_PASSWORD = env("APIE2E_AUTH_OPERATOR_PASSWORD");
export const TERRITORY_EMAIL = env("APIE2E_AUTH_TERRITORY_EMAIL");
export const TERRITORY_PASSWORD = env("APIE2E_AUTH_TERRITORY_PASSWORD");

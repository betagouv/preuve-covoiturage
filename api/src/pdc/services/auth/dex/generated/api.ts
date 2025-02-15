/* this code was generated by automated tool, 
   should not edit by hand */

export interface Dex {
  GetClient(request: GetClientReq): Promise<GetClientResp>;
  CreateClient(request: CreateClientReq): Promise<CreateClientResp>;
  UpdateClient(request: UpdateClientReq): Promise<UpdateClientResp>;
  DeleteClient(request: DeleteClientReq): Promise<DeleteClientResp>;
  CreatePassword(request: CreatePasswordReq): Promise<CreatePasswordResp>;
  UpdatePassword(request: UpdatePasswordReq): Promise<UpdatePasswordResp>;
  DeletePassword(request: DeletePasswordReq): Promise<DeletePasswordResp>;
  ListPasswords(request: ListPasswordReq): Promise<ListPasswordResp>;
  CreateConnector(request: CreateConnectorReq): Promise<CreateConnectorResp>;
  UpdateConnector(request: UpdateConnectorReq): Promise<UpdateConnectorResp>;
  DeleteConnector(request: DeleteConnectorReq): Promise<DeleteConnectorResp>;
  ListConnectors(request: ListConnectorReq): Promise<ListConnectorResp>;
  GetVersion(request: VersionReq): Promise<VersionResp>;
  GetDiscovery(request: DiscoveryReq): Promise<DiscoveryResp>;
  ListRefresh(request: ListRefreshReq): Promise<ListRefreshResp>;
  RevokeRefresh(request: RevokeRefreshReq): Promise<RevokeRefreshResp>;
  VerifyPassword(request: VerifyPasswordReq): Promise<VerifyPasswordResp>;
}

export interface Client {
  id?: string;
  secret?: string;
  redirectUris?: string[];
  trustedPeers?: string[];
  public?: boolean;
  name?: string;
  logoUrl?: string;
}

export interface GetClientReq {
  id?: string;
}

export interface GetClientResp {
  client?: Client;
}

export interface CreateClientReq {
  client?: Client;
}

export interface CreateClientResp {
  alreadyExists?: boolean;
  client?: Client;
}

export interface DeleteClientReq {
  id?: string;
}

export interface DeleteClientResp {
  notFound?: boolean;
}

export interface UpdateClientReq {
  id?: string;
  redirectUris?: string[];
  trustedPeers?: string[];
  name?: string;
  logoUrl?: string;
}

export interface UpdateClientResp {
  notFound?: boolean;
}

export interface Password {
  email?: string;
  hash?: Uint8Array;
  username?: string;
  userId?: string;
}

export interface CreatePasswordReq {
  password?: Password;
}

export interface CreatePasswordResp {
  alreadyExists?: boolean;
}

export interface UpdatePasswordReq {
  email?: string;
  newHash?: Uint8Array;
  newUsername?: string;
}

export interface UpdatePasswordResp {
  notFound?: boolean;
}

export interface DeletePasswordReq {
  email?: string;
}

export interface DeletePasswordResp {
  notFound?: boolean;
}

export interface ListPasswordReq {

}

export interface ListPasswordResp {
  passwords?: Password[];
}

export interface Connector {
  id?: string;
  type?: string;
  name?: string;
  config?: Uint8Array;
}

export interface CreateConnectorReq {
  connector?: Connector;
}

export interface CreateConnectorResp {
  alreadyExists?: boolean;
}

export interface UpdateConnectorReq {
  id?: string;
  newType?: string;
  newName?: string;
  newConfig?: Uint8Array;
}

export interface UpdateConnectorResp {
  notFound?: boolean;
}

export interface DeleteConnectorReq {
  id?: string;
}

export interface DeleteConnectorResp {
  notFound?: boolean;
}

export interface ListConnectorReq {

}

export interface ListConnectorResp {
  connectors?: Connector[];
}

export interface VersionReq {

}

export interface VersionResp {
  server?: string;
  api?: number;
}

export interface DiscoveryReq {

}

export interface DiscoveryResp {
  issuer?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  jwksUri?: string;
  userinfoEndpoint?: string;
  deviceAuthorizationEndpoint?: string;
  introspectionEndpoint?: string;
  grantTypesSupported?: string[];
  responseTypesSupported?: string[];
  subjectTypesSupported?: string[];
  idTokenSigningAlgValuesSupported?: string[];
  codeChallengeMethodsSupported?: string[];
  scopesSupported?: string[];
  tokenEndpointAuthMethodsSupported?: string[];
  claimsSupported?: string[];
}

export interface RefreshTokenRef {
  id?: string;
  clientId?: string;
  createdAt?: number;
  lastUsed?: number;
}

export interface ListRefreshReq {
  userId?: string;
}

export interface ListRefreshResp {
  refreshTokens?: RefreshTokenRef[];
}

export interface RevokeRefreshReq {
  userId?: string;
  clientId?: string;
}

export interface RevokeRefreshResp {
  notFound?: boolean;
}

export interface VerifyPasswordReq {
  email?: string;
  password?: string;
}

export interface VerifyPasswordResp {
  verified?: boolean;
  notFound?: boolean;
}

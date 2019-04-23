export interface ProviderInterface {
  readonly signature: string;
  boot():Promise<void> | void;
}

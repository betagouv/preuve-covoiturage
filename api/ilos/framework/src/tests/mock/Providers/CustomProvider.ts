import { ProviderInterface, provider } from '@ilos/common';

@provider()
export class CustomProvider implements ProviderInterface {
  private value: string;

  boot() {
    this.value = 'default';
  }

  get() {
    return this.value;
  }

  set(value: string) {
    this.value = value;
  }
}

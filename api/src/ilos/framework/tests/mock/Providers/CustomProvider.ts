import { provider, ProviderInterface } from "@/ilos/common/index.ts";

@provider()
export class CustomProvider implements ProviderInterface {
  private value: string = "not-set";

  boot() {
    this.value = "default";
  }

  get() {
    return this.value;
  }

  set(value: string) {
    this.value = value;
  }
}

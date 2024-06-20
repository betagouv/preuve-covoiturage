import { serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as BaseServiceProvider } from "@/ilos/core/index.ts";
import { CustomProvider } from "../Providers/CustomProvider.ts";
import { AddAction } from "./actions/AddAction.ts";

@serviceProvider({
  providers: [CustomProvider],
  handlers: [AddAction],
})
export class ServiceProvider extends BaseServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set("math:");
  }
}

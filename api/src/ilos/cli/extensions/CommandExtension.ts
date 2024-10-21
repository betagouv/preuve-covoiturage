import {
  CommandInterface,
  extension,
  NewableType,
  RegisterHookInterface,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";
import { identifierList } from "../constants.ts";

@extension({
  name: "commands",
  autoload: true,
})
export class CommandExtension implements RegisterHookInterface {
  constructor(readonly commands: NewableType<NewableType<CommandInterface>>[] = []) {}

  register(serviceContainer: ServiceContainerInterface) {
    for (const command of this.commands) {
      serviceContainer.getContainer().bind(command).toSelf();
      serviceContainer.getContainer().root.bind(identifierList).toConstantValue(() =>
        serviceContainer.getContainer().get(command)
      );
    }
  }
}

import { assertEquals, describe, it, sinon } from "@/dev_deps.ts";
import {
  command,
  ResultType,
  serviceProvider as serviceProviderDecorator,
} from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { Command } from "../parents/Command.ts";
import { CommandRegistry } from "../providers/CommandRegistry.ts";
import { CommandExtension } from "./CommandExtension.ts";

function setup() {
  const fake = sinon.fake();
  @command()
  class BasicCommand extends Command {
    static readonly signature: string = "hello <name>";
    static readonly description: string = "toto";
    static readonly options = [
      {
        signature: "-h, --hi",
        description: "Say hi",
      },
    ];

    public async call(name: string, options?: any): Promise<ResultType> {
      fake(name, options);
      return `Hello ${name}`;
    }
  }

  @serviceProviderDecorator({
    commands: [BasicCommand],
  })
  class ServiceProvider extends AbstractServiceProvider {
    extensions = [CommandExtension];
  }

  const serviceProvider = new ServiceProvider();

  return { serviceProvider, fake };
}

describe("CommandExtension", () => {
  it("should register", async () => {
    const { serviceProvider } = setup();
    await serviceProvider.register();
    await serviceProvider.init();

    const basicCommand =
      serviceProvider.getContainer().get(CommandRegistry).commands[0];
    assertEquals(basicCommand.name(), "hello");
    assertEquals(basicCommand.description(), "toto");
  });

  it("should work", async () => {
    const { serviceProvider, fake } = setup();
    const container = serviceProvider.getContainer();
    await serviceProvider.register();
    await serviceProvider.init();
    const commander = container.get<CommandRegistry>(CommandRegistry);
    commander.parse(["", "", "hello", "john"]);
    assertEquals(fake.getCalls().pop().args, ["john", {}]);
  });
});

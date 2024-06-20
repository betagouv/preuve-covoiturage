import { assertEquals, describe, it, sinon } from "@/dev_deps.ts";
import {
  command as commandDecorator,
  ExtensionInterface,
  kernel as kernelDecorator,
  NewableType,
  ResultType,
} from "@/ilos/common/index.ts";
import { Kernel } from "@/ilos/core/index.ts";
import { CommandExtension } from "../extensions/CommandExtension.ts";
import { Command } from "../parents/Command.ts";
import { CommandRegistry } from "../providers/CommandRegistry.ts";
import { CliTransport } from "./CliTransport.ts";

function setup() {
  @commandDecorator()
  class BasicCommand extends Command {
    static readonly signature: string = "hello <name>";
    static readonly description: string = "The hello world command";
    static readonly options = [
      {
        signature: "-h, --hi",
        description: "Say hi",
      },
    ];

    public async call(name: string, options?: any): Promise<ResultType> {
      if (options && "hi" in options) {
        return `Hi ${name}`;
      }
      return `Hello ${name}`;
    }
  }

  @kernelDecorator({
    commands: [BasicCommand],
  })
  class BasicKernel extends Kernel {
    readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension];
  }

  const kernel = new BasicKernel();
  return { kernel };
}

describe("Cli transport", () => {
  it("should work", async () => {
    const { kernel } = setup();
    await kernel.bootstrap();
    const cliTransport = new CliTransport(kernel);
    const container = kernel.getContainer();
    const commander = container.get<CommandRegistry>(CommandRegistry);
    sinon.stub(commander, "output").callsFake((...args: any[]) => {
      assertEquals(args[0], "Hello john");
    });
    container.unbind(CommandRegistry);
    container.bind(CommandRegistry).toConstantValue(commander);
    return cliTransport.up(["", "", "hello", "john"]);
  });
});

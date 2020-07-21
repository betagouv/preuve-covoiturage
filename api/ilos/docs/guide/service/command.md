
#### Command

Command is use to expose API command line action with cli friendly params

**ExampleCommand.ts

```ts
import {
  command,
  CommandInterface,
  CommandOptionType,
  KernelInterfaceResolver
} from "@ilos/common";

// yarn ilos myservice:example yoyo --option_with_param "ma couille"  --option_without_param
@command()
export class ExampleCommand implements CommandInterface {
  // action name
  protected readonly processAction = "myservice:example";

    // configuration
  static readonly signature: string = "myservice:example [param]";
  static readonly description: string = "Start example action";

    // define cli friendly options
  static readonly options: CommandOptionType[] = [
    {
      signature: "--option_with_param <option_param>",
      description: "Option with param",
      default: "Default param value"
    },
    {
      signature: "--option_without_param",
      description: "Option without param"
    }
  ];

    // as any service kernel is accessible as injected service in command constructor
  constructor(protected kernel: KernelInterfaceResolver) {}

    // implement action
  public async call(id: string, options: any): Promise<string> {
    const { parent, option_with_param, option_without_param } = options;

    console.log(
      `Start command ExampleCommand ${id} with param ${parent.args.join(",")}`
    );
    if (option_with_param) {
      console.log("option params", option_with_param);
    }

    if (option_without_param) {
      console.log("option without param");
    }

    this.processCommand(id, parent.args, {
      option_with_param,
      option_without_param
    });

    return "Done!";
  }

  protected async processCommand(
    id: string,
    param: string,
    options: { option_with_param?: string; option_without_param?: string }
  ): Promise<void> {
    // const action = method ? this.processAction : this.processAllAction;

    // -- example of action call inside the service --
    // define context
    const context = {
      call: {
        user: {}
      },
      channel: {
        service: "myservice",
        transport: "cli"
      }
    };

    // user kernel call to call actions
    return this.kernel.call(this.processAction, { param, options }, context);
  }
}
```
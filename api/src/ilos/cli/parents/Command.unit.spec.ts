import { assertEquals, it } from "@/dev_deps.ts";
import { CommandOptionType, ResultType } from "@/ilos/common/index.ts";
import { Command } from "./Command.ts";

it("Command: works", async () => {
  class BasicCommand extends Command {
    static readonly signature: string = "hello <name>";
    static readonly description: string = "basic hello command";
    static readonly options: CommandOptionType[] = [{
      signature: "-h, --hi",
      description: "hi",
    }];
    public async call(name: string, opts: any): Promise<ResultType> {
      if (name === "crash") {
        throw new Error();
      }
      return opts && "hi" in opts ? `Hi ${name}!` : `Hello ${name}!`;
    }
  }
  const cmd = new BasicCommand();
  const r = await cmd.call("John", {});
  assertEquals(r, "Hello John!");
});

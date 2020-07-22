
## Config

**example.ts**

```ts
export const my_config = {
  prop: "toto"
};
```

Example of using inside an action
```ts
//...
export class AnotherAction extends Action {
  // ...  

  // use config via ConfigInterfaceResolver
  constructor(private config: ConfigInterfaceResolver) {
    super();
  }

  public async handle(request: any, context: ContextType): Promise<any> {
    return {
        // config accessible via handler
        example_config: this.config.get("example.my_config.prop", "OUAT"),
        default_config: this.config.get("example.my_config.no_config", "Default")
    };
  }
}
```
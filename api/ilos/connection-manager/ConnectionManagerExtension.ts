import {
  ContainerInterface,
  ConfigInterfaceResolver,
  ConnectionDeclarationType,
  ConnectionInterface,
  RegisterHookInterface,
  InitHookInterface,
  DestroyHookInterface,
  NewableType,
  ServiceContainerInterface,
  extension,
} from '@ilos/common';

@extension({
  name: 'connections',
})
export class ConnectionManagerExtension implements RegisterHookInterface, InitHookInterface, DestroyHookInterface {
  protected connectionRegistry: Map<symbol, ConnectionInterface> = new Map();

  /**
   * instanceSymbolRegistry, map used for registring, associate a symbol with a config key
   * @protected
   * @type {Map<Symbol, string>}
   * @memberof ConnectionManagerExtension
   */
  protected instanceSymbolRegistry: Map<symbol, string> = new Map();

  /**
   * connectionConstructorSymbolRegistry, map used for registring, associate a Connection constructor with a Symbol
   * @protected
   * @type {Map<NewableType<ConnectionInterface>, Symbol>}
   * @memberof ConnectionManagerExtension
   */
  protected connectionConstructorSymbolRegistry: Map<NewableType<ConnectionInterface>, symbol> = new Map();

  /**
   * mappingRegistry, Map<NewableType<ConnectionInterface>, Map<NewableType<any>, instanceSymbolRegistry>>
   * @protected
   * @type {Map<NewableType<ConnectionInterface>, Symbol>}
   * @memberof ConnectionManagerExtension
   */
  protected mappingRegistry: Map<NewableType<ConnectionInterface>, Map<NewableType<any>, symbol>> = new Map();

  constructor(protected readonly connections: ConnectionDeclarationType[]) {}

  async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    if (!serviceContainer.getContainer().isBound(ConfigInterfaceResolver)) {
      throw new Error('Missing config provider');
    }

    for (const serviceConnectionDeclaration of this.connections) {
      if (Array.isArray(serviceConnectionDeclaration)) {
        const [connectionConstructor, connectionConfigKey, serviceConstructors] = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfigKey, serviceConstructors);
      } else {
        const {
          use: connectionConstructor,
          withConfig: connectionConfigKey,
          inside: serviceConstructors,
        } = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfigKey, serviceConstructors);
      }
    }

    this.setUpContainer(serviceContainer.getContainer());
  }

  async init(serviceContainer: ServiceContainerInterface) {
    const connections = this.createAllConnections((k) => serviceContainer.get(ConfigInterfaceResolver).get(k));

    for (const connection of connections) {
      await connection.up();
    }
  }

  async destroy(): Promise<void> {
    const connectionRegistry = this.connectionRegistry.entries();
    for (const [, connection] of connectionRegistry) {
      try {
        await connection.down();
      } catch (e) {
        // do nothing
      }
    }
  }

  protected setUpContainer(container: ContainerInterface) {
    const connectionConstructorRegistry = this.connectionConstructorSymbolRegistry.entries();
    for (const [connectionConstructor, connectionSymbol] of connectionConstructorRegistry) {
      let requesterMapRegistry = new Map();
      if (this.mappingRegistry.has(connectionConstructor)) {
        requesterMapRegistry = this.mappingRegistry.get(connectionConstructor);

        const connectionMap = requesterMapRegistry.entries();
        for (const [requesterConstructor, instanceSymbol] of connectionMap) {
          container
            .bind(connectionConstructor)
            .toDynamicValue((context) =>
              this.getConnection(instanceSymbol, connectionConstructor, (k) =>
                context.container.get(ConfigInterfaceResolver).get(k),
              ),
            )
            .whenInjectedInto(requesterConstructor);
        }
      }

      if (this.instanceSymbolRegistry.has(connectionSymbol)) {
        container
          .bind(connectionConstructor)
          .toDynamicValue((context) =>
            this.getConnection(connectionSymbol, connectionConstructor, (k) =>
              context.container.get(ConfigInterfaceResolver).get(k),
            ),
          )
          .when((request) => {
            const parentRequest = request.parentRequest;
            if (parentRequest === null) {
              return true;
            }
            const binding = parentRequest.bindings[0];
            if (!binding) {
              return true;
            }
            const constructor = parentRequest.bindings[0].implementationType;
            return !requesterMapRegistry.has(constructor);
          });
      }
    }
  }

  protected registerConnectionRequest(
    connectionConstructor: NewableType<ConnectionInterface>,
    connectionConfigKey: string,
    serviceConstructors: NewableType<any>[] = [],
  ): void {
    const connectionConstructorSymbol = this.getConnectionConstructorSymbol(connectionConstructor);
    const instanceSymbol = this.getInstanceSymbol(
      connectionConfigKey,
      serviceConstructors.length === 0 ? connectionConstructorSymbol : undefined,
    );

    if (serviceConstructors.length > 0) {
      this.setConstructorsMapping(serviceConstructors, connectionConstructor, instanceSymbol);
    }
  }

  protected createAllConnections(configGetter: (k: string) => any): ConnectionInterface[] {
    const connections: ConnectionInterface[] = [];
    const connectionConstructorRegistry = this.connectionConstructorSymbolRegistry.entries();

    for (const [connectionConstructor, connectionSymbol] of connectionConstructorRegistry) {
      if (this.mappingRegistry.has(connectionConstructor)) {
        const requesterMapRegistry = this.mappingRegistry.get(connectionConstructor);

        const connectionMap = requesterMapRegistry.entries();
        for (const [, instanceSymbol] of connectionMap) {
          connections.push(this.getConnection(instanceSymbol, connectionConstructor, configGetter));
        }
      }

      if (this.instanceSymbolRegistry.has(connectionSymbol)) {
        connections.push(this.getConnection(connectionSymbol, connectionConstructor, configGetter));
      }
    }
    return connections;
  }

  protected getConnection(
    instanceToken: symbol,
    connectionConstructor: NewableType<ConnectionInterface>,
    configGetter: (k: string) => any,
  ): ConnectionInterface {
    if (!this.connectionRegistry.has(instanceToken)) {
      if (!this.instanceSymbolRegistry.has(instanceToken)) {
        throw new Error('Unable to find connection');
      }
      const configKey = this.instanceSymbolRegistry.get(instanceToken);
      const config = typeof configKey === 'string' ? configGetter(configKey) : configKey;
      this.createConnection(connectionConstructor, config, instanceToken);
    }
    // .get(configurationKey, {});
    return this.connectionRegistry.get(instanceToken);
  }

  protected createConnection(
    connectionConstructor: NewableType<ConnectionInterface>,
    config: { [k: string]: any },
    instanceToken?: symbol,
  ): ConnectionInterface {
    const connection = new connectionConstructor(config);

    if (instanceToken) {
      this.connectionRegistry.set(instanceToken, connection);
    }

    return connection;
  }

  protected getConnectionConstructorSymbol(connConstructor: NewableType<ConnectionInterface>): symbol {
    if (!this.connectionConstructorSymbolRegistry.has(connConstructor)) {
      this.connectionConstructorSymbolRegistry.set(connConstructor, Symbol());
    }
    return this.connectionConstructorSymbolRegistry.get(connConstructor);
  }

  protected getInstanceSymbol(configurationKey: string, fallback?: symbol): symbol {
    let instanceSymbol = Symbol();

    if (fallback) {
      instanceSymbol = fallback;
    }

    if (!this.instanceSymbolRegistry.has(instanceSymbol)) {
      this.instanceSymbolRegistry.set(instanceSymbol, configurationKey);
    }
    return instanceSymbol;
  }

  protected setConstructorsMapping(
    serviceConstructors: NewableType<any>[],
    connectionConstructor: NewableType<ConnectionInterface>,
    instanceSymbol: symbol,
  ) {
    if (!this.mappingRegistry.has(connectionConstructor)) {
      this.mappingRegistry.set(connectionConstructor, new Map());
    }

    const connectionMapping = this.mappingRegistry.get(connectionConstructor);

    if (serviceConstructors) {
      for (const serviceConstructor of serviceConstructors) {
        if (!connectionMapping.has(serviceConstructor)) {
          connectionMapping.set(serviceConstructor, instanceSymbol);
        }
      }
    }
  }
}

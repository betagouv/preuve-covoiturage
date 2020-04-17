// import { describe } from 'mocha';
// import chai from 'chai';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';

// import { serviceProvider, provider, ServiceContainerInterfaceResolver } from '@ilos/common';
// import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
// import chaiAsPromised from 'chai-as-promised';

// import { CheckEngine } from '../src/engine/CheckEngine';
// import { StaticCheckInterface, CheckInterface } from '../src/interfaces/CheckInterface';
// import {
//   FraudCheckRepositoryProviderInterfaceResolver,
//   FraudCheckRepositoryProviderInterface,
//   FraudCheck,
//   FraudCheckResult,
// } from '../src/interfaces';

// chai.use(sinonChai);
// chai.use(chaiAsPromised);
// const { expect } = chai;

// describe('Check engine', async () => {
//   const meta: FraudCheck = {
//     _id: 1,
//     karma: 0,
//     meta: {},
//     status: 'pending',
//   };

//   @provider({
//     identifier: FraudCheckRepositoryProviderInterfaceResolver,
//   })
//   class FakeFraudCheckRepository extends FraudCheckRepositoryProviderInterfaceResolver
//     implements FraudCheckRepositoryProviderInterface {
//     public async getScore(acquisitionId: number): Promise<number> {
//       return 0;
//     }

//     public async findOrCreateFraudCheck(acquisitionId: number, method: string): Promise<FraudCheck<any>> {
//       return meta;
//     }

//     public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
//       return;
//     }
//   }

//   @serviceProvider({
//     providers: [FakeFraudCheckRepository],
//   })
//   class ServiceProvider extends AbstractServiceProvider {}

//   let sp: ServiceProvider;

//   beforeEach(async () => {
//     sp = new ServiceProvider();
//     await sp.register();
//     await sp.init();
//   });

//   it('should throw an error if method not found', async () => {
//     @provider()
//     class SimpleCheckEngine extends CheckEngine {
//       public readonly checks: StaticCheckInterface[] = [];
//     }

//     sp.bind(SimpleCheckEngine);
//     const engine = sp.get(SimpleCheckEngine);

//     await (expect(engine.apply(0, ['mymethod'])) as any).to.eventually.rejectedWith('Unknown check mymethod');
//   });

//   it('should not process if status is done', async () => {
//     @provider()
//     class TestCheck implements CheckInterface {
//       public static readonly key = 'test';
//       async handle(_acquisitionId: number): Promise<FraudCheckResult> {
//         return {
//           meta: {
//             test: 'toto',
//           },
//           karma: 1,
//         };
//       }
//     }

//     @provider()
//     class SimpleCheckEngine extends CheckEngine {
//       public readonly checks: StaticCheckInterface[] = [TestCheck];
//       constructor(
//         repository: FraudCheckRepositoryProviderInterfaceResolver,
//         service: ServiceContainerInterfaceResolver,
//       ) {
//         super(repository, service);
//       }
//     }
//     sp.bind(SimpleCheckEngine);
//     const engine = sp.get(SimpleCheckEngine);
//     const repository = sp.get(FraudCheckRepositoryProviderInterfaceResolver);

//     sinon.spy(repository, 'updateFraudCheck');

//     meta.status = 'done';
//     await engine.apply(0, ['test']);
//     expect(repository.updateFraudCheck).to.have.callCount(0);
//   });

//   it('should save state and throw if processor failed', async () => {
//     const errorMessage = 'this is not working';
//     @provider()
//     class TestCheck implements CheckInterface {
//       public static readonly key = 'test';
//       async handle(_acquisitionId: number): Promise<FraudCheckResult> {
//         throw new Error(errorMessage);
//       }
//     }

//     @provider()
//     class SimpleCheckEngine extends CheckEngine {
//       public readonly checks: StaticCheckInterface[] = [TestCheck];
//       constructor(
//         repository: FraudCheckRepositoryProviderInterfaceResolver,
//         service: ServiceContainerInterfaceResolver,
//       ) {
//         super(repository, service);
//       }
//     }
//     sp.bind(SimpleCheckEngine);
//     const engine = sp.get(SimpleCheckEngine);
//     const repository = sp.get(FraudCheckRepositoryProviderInterfaceResolver);

//     sinon.spy(repository, 'updateFraudCheck');

//     meta.status = 'pending';
//     await (expect(engine.apply(0, ['test'])) as any).to.eventually.rejectedWith(errorMessage);
//     expect(repository.updateFraudCheck).to.have.calledWith({
//       ...meta,
//       status: 'error',
//       meta: {
//         error: errorMessage,
//       },
//     });
//   });

//   it('should save state if processor succeed', async () => {
//     const metaResult = {
//       karma: 10,
//       meta: {
//         this: 'is.working',
//       },
//     };

//     @provider()
//     class TestCheck implements CheckInterface {
//       public static readonly key = 'test';
//       async handle(_acquisitionId: number): Promise<FraudCheckResult> {
//         return metaResult;
//       }
//     }

//     @provider()
//     class SimpleCheckEngine extends CheckEngine {
//       public readonly checks: StaticCheckInterface[] = [TestCheck];
//       constructor(
//         repository: FraudCheckRepositoryProviderInterfaceResolver,
//         service: ServiceContainerInterfaceResolver,
//       ) {
//         super(repository, service);
//       }
//     }
//     sp.bind(SimpleCheckEngine);
//     const engine = sp.get(SimpleCheckEngine);
//     const repository = sp.get(FraudCheckRepositoryProviderInterfaceResolver);

//     sinon.spy(repository, 'updateFraudCheck');

//     meta.status = 'pending';
//     await engine.apply(0, ['test']);
//     expect(repository.updateFraudCheck).to.have.calledWith({
//       ...meta,
//       ...metaResult,
//       status: 'done',
//     });
//   });
// });

import sinon from 'sinon';

export function mockModule<T extends { [K: string]: any }>(moduleToMock: T, defaultMockValuesForMock: Partial<{ [K in keyof T]: T[K] }>) {
  return (sandbox: sinon.SinonSandbox, returnOverrides?: Partial<{ [K in keyof T]: T[K] }>): void => {
    const functions = Object.keys(moduleToMock);
    const returns = returnOverrides || {};
    functions.forEach((f) => {
      sandbox.stub(moduleToMock, f).callsFake(returns[f] || defaultMockValuesForMock[f]);
    });
  };
}

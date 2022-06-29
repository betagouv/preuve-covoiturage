import { ContextType, KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { RuleInterface } from '../../engine/interfaces';
import { MutateCampaignInseesFilter } from './MutateCampaignInseesFilter';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

  // Constants
  RANDOM_RULE: RuleInterface;
  TERRITORY_WHITELIST_RULE: RuleInterface;
  TERRITORY_BLACKLIST_RULE: RuleInterface;
  TERRITORY_COM_BLACKLIST_RULE: RuleInterface;

  // Tested token
  mutateCampaignInseeFilter: MutateCampaignInseesFilter;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.mutateCampaignInseeFilter = new MutateCampaignInseesFilter(t.context.fakeKernelInterfaceResolver);

  t.context.RANDOM_RULE = { slug: 'range_filter', parameters: { is_fake: true } };
  t.context.TERRITORY_WHITELIST_RULE = {
    slug: 'territory_whitelist_filter',
    parameters: [
      {
        start: {
          aom: ['234400034'],
        },
        end: {
          aom: ['234400034'],
        },
      },
    ],
  };
  t.context.TERRITORY_BLACKLIST_RULE = {
    slug: 'territory_blacklist_filter',
    parameters: [
      {
        start: {
          aom: ['244900015'],
        },
        end: {
          aom: ['244900015'],
        },
      },
      {
        start: {
          aom: ['244400404'],
        },
        end: {
          aom: ['244400404'],
        },
      },
      {
        start: {
          aom: ['247200132'],
        },
        end: {
          aom: ['247200132'],
        },
      },
      {
        start: {
          aom: ['200071678'],
        },
        end: {
          aom: ['200071678'],
        },
      },
    ],
  };
  t.context.TERRITORY_COM_BLACKLIST_RULE = {
    slug: 'territory_blacklist_filter',
    parameters: [
      {
        start: { com: ['75056'] },
        end: { com: ['75056'] },
      },
    ],
  };
  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');
});

test.afterEach((t) => {
  t.context.kernelInterfaceResolverStub?.restore();
});

test('MutateCampaignInseesFilter: should not mutate if no global_rules', async (t) => {
  // Arrange
  const global_rules: RuleInterface[] = [];

  // Act
  const mutated_global_rules = await t.context.mutateCampaignInseeFilter!.call(global_rules);

  // Assert
  t.is(global_rules, mutated_global_rules);
});

test('MutateCampaignInseesFilter: should not mutate if no global_rules matches', async (t) => {
  // Arrange
  const global_rules: RuleInterface[] = [t.context.RANDOM_RULE!];

  // Act
  const mutated_global_rules = await t.context.mutateCampaignInseeFilter!.call(global_rules);

  // Assert
  t.is(global_rules, mutated_global_rules);
});

test('MutateCampaignInseesFilter: should mutate once and no others if one global_rules matches', async (t) => {
  // Arrange
  const global_rules: RuleInterface[] = [t.context.RANDOM_RULE!, t.context.TERRITORY_WHITELIST_RULE!];

  // Act
  const mutated_global_rules = await t.context.mutateCampaignInseeFilter?.call(global_rules);

  // Assert
  t.deepEqual(mutated_global_rules, [
    t.context.RANDOM_RULE!,
    {
      slug: 'territory_whitelist_filter',
      parameters: [
        {
          start: {
            aom: [{ insee: '234400034', name: 'Pays de la Loire' }],
          },
          end: {
            aom: [{ insee: '234400034', name: 'Pays de la Loire' }],
          },
        },
      ],
    },
  ]);
});

test('MutateCampaignInseesFilter: should mutate thrice and no others if one global_rules matches', async (t) => {
  // Arrange
  const global_rules: RuleInterface[] = [
    t.context.RANDOM_RULE!,
    t.context.TERRITORY_WHITELIST_RULE!,
    t.context.TERRITORY_BLACKLIST_RULE!,
    t.context.TERRITORY_COM_BLACKLIST_RULE!,
  ];

  // Act
  const mutated_global_rules = await t.context.mutateCampaignInseeFilter!.call(global_rules);

  // Assert
  t.deepEqual(mutated_global_rules, [
    t.context.RANDOM_RULE!,
    {
      slug: 'territory_whitelist_filter',
      parameters: [
        {
          start: {
            aom: [{ insee: '234400034', name: 'Pays de la Loire' }],
          },
          end: {
            aom: [{ insee: '234400034', name: 'Pays de la Loire' }],
          },
        },
      ],
    },
    {
      slug: 'territory_blacklist_filter',
      parameters: [
        {
          start: {
            aom: [{ insee: '244900015', name: 'CU Angers Loire Métropole' }],
          },
          end: {
            aom: [{ insee: '244900015', name: 'CU Angers Loire Métropole' }],
          },
        },
        {
          start: {
            aom: [{ insee: '244400404', name: 'Nantes Métropole' }],
          },
          end: {
            aom: [{ insee: '244400404', name: 'Nantes Métropole' }],
          },
        },
        {
          start: {
            aom: [{ insee: '247200132', name: 'CU Le Mans Métropole' }],
          },
          end: {
            aom: [{ insee: '247200132', name: 'CU Le Mans Métropole' }],
          },
        },
        {
          start: {
            aom: [{ insee: '200071678', name: 'CA Agglomération du Choletais' }],
          },
          end: {
            aom: [{ insee: '200071678', name: 'CA Agglomération du Choletais' }],
          },
        },
      ],
    },
    {
      slug: 'territory_blacklist_filter',
      parameters: [
        {
          start: { com: [{ insee: '75056', name: 'Paris' }] },
          end: { com: [{ insee: '75056', name: 'Paris' }] },
        },
      ],
    },
  ]);
});

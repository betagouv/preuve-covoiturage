import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CampaignPgRepositoryProvider } from './CampaignPgRepositoryProvider';
import { CampaignInterface } from '../interfaces';

interface TestContext {
  connection: PostgresConnection;
  repository: CampaignPgRepositoryProvider;
  campaign: CampaignInterface;
  territory_id: number;
}

const test = anyTest as TestInterface<TestContext>;

function makeCampaign(data: Partial<CampaignInterface> = {}): CampaignInterface {
  const start = new Date();
  start.setDate(-7);
  const end = new Date();
  end.setDate(end.getDate() + 7);

  return {
    territory_id: 0,
    name: 'Campaign',
    description: 'Campaign description',
    start_date: start,
    end_date: end,
    unit: 'euro',
    status: 'draft',
    global_rules: [],
    rules: [],
    ...data,
  };
}

test.before(async (t) => {
  t.context.territory_id = 0;
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });
  await t.context.connection.up();
  t.context.repository = new CampaignPgRepositoryProvider(t.context.connection);
  t.context.campaign = await t.context.repository.create(makeCampaign());
});

test.after.always(async (t) => {
  await t.context.connection.getClient().query({
    text: `DELETE FROM ${t.context.repository.table} WHERE territory_id = $1`,
    values: [t.context.territory_id],
  });
  await t.context.connection.down();
});

test.serial('Should create campaign', async (t) => {
  const campaignData = makeCampaign();
  const campaign = await t.context.repository.create(campaignData);

  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [campaign._id],
  });

  t.is(result.rowCount, 1);
  t.is(result.rows[0].name, campaignData.name);
  t.is(result.rows[0].status, 'draft');
});

test.serial('Should find campaign', async (t) => {
  t.log(t.context.campaign);
  const campaign = await t.context.repository.find(t.context.campaign._id);
  t.is(campaign.name, t.context.campaign.name);
  t.is(campaign.status, t.context.campaign.status);
});

test.serial('Should find campaign by territory', async (t) => {
  const campaign = await t.context.repository.findOneWhereTerritory(t.context.campaign._id, t.context.territory_id);
  t.is(campaign.name, t.context.campaign.name);
  t.is(campaign.status, t.context.campaign.status);
});

test.serial('Should not find campaign by territory', async (t) => {
  const campaign = await t.context.repository.findOneWhereTerritory(t.context.campaign._id, 1);
  t.is(campaign, undefined);
});

test.serial('Should patch campaign', async (t) => {
  const name = 'Awesome campaign';
  const campaign = await t.context.repository.patch(t.context.campaign._id, { name });

  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.campaign._id],
  });

  t.not(campaign.name, t.context.campaign.name);
  t.is(campaign.name, name);
  t.is(result.rowCount, 1);
  t.is(result.rows[0].name, name);
  t.context.campaign.name = name;
});

test.serial('Should patch campaign by territory id', async (t) => {
  const name = 'Awesome campaign 2';
  const campaign = await t.context.repository.patchWhereTerritory(t.context.campaign._id, t.context.territory_id, {
    name,
  });

  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.campaign._id],
  });

  t.not(campaign.name, t.context.campaign.name);
  t.is(campaign.name, name);
  t.is(result.rowCount, 1);
  t.is(result.rows[0].name, name);
  t.context.campaign.name = name;
});

test.serial('Should not patch campaign by territory id', async (t) => {
  const name = 'Not updating!';
  const err = await t.throwsAsync(async () =>
    t.context.repository.patchWhereTerritory(t.context.campaign._id, 1, { name }),
  );
  t.is(err.message, 'Not found');

  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.campaign._id],
  });
  t.is(result.rowCount, 1);
  t.not(result.rows[0].name, name);
});

// test.serial('Should not patch campaign if active', async (t) => {

//   const name = 'Nope!';
//   const err = await t.throwsAsync(async () => t.context.repository.patch(t.context.campaign._id, { name }));
//   t.is(err.message, 'Not found');

//   const result = await t.context.connection.getClient().query({
//     text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
//     values: [t.context.campaign._id],
//   });
//   t.is(result.rowCount, 1);
//   t.not(result.rows[0].name, name);
// });

test.serial('Should not delete campaign if active', async (t) => {
  await t.context.connection.getClient().query({
    text: `UPDATE ${t.context.repository.table} SET status = 'active'::policy.policy_status_enum WHERE _id = $1`,
    values: [t.context.campaign._id],
  });
  const err = await t.throwsAsync(async () => t.context.repository.deleteDraftOrTemplate(t.context.campaign._id));
  t.is(err.message, 'Not found');

  const result = await t.context.connection.getClient().query({
    text: `SELECT deleted_at FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.campaign._id],
  });

  t.is(result.rowCount, 1);
  t.is(result.rows[0].deleted_at, null);
});

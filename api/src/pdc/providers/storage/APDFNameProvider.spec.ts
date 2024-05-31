import test from 'ava';
import path from 'path';
import os from 'os';
import { APDFNameProvider } from './APDFNameProvider.ts';

test('Stringify APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filename({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_00,
    }),
    'APDF-2022-01-1-2-111-100-22200-yolo.xlsx',
  );
});

test('Stringify APDF: filename null trips and amount', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 0,
      subsidized: 0,
      amount: 0,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-0-0-0-yolo.xlsx'),
  );
});

test('Stringify APDF: filename rounded amount', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_99,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-111-100-22299-yolo.xlsx'),
  );
});

test('Stringify APDF: filepath with string', (t) => {
  const provider = new APDFNameProvider();
  t.is(provider.filepath('APDF-2022-01-1-2-3-4-yolo.xlsx'), path.join(os.tmpdir(), 'APDF-2022-01-1-2-3-4-yolo.xlsx'));
});

test('Stringify APDF: filepath with object', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_00,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-111-100-22200-yolo.xlsx'),
  );
});

test('Parse APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('APDF-2022-01-1-2-111-100-22200-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
    trips: 111,
    subsidized: 100,
    amount: 222_00,
  });
});

test('Parse APDF: filename with prefix', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('1/APDF-2022-01-1-2-111-100-22200-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
    trips: 111,
    subsidized: 100,
    amount: 222_00,
  });
});

// sanitize campaign names

const list = [
  ['#1_LAVALAGGLO_2022_01', '1_lavalagglo_2022_01'],
  ['#1_MetrRouenNormandie_2022_04', '1_metrrouennormandie_2022_04'],
  ['#1_SMT_2022_02', '1_smt_2022_02'],
  ['Campagne 1', 'campagne_1'],
  ['Campagne avril_juin 2022 CCPE Karos', 'campagne_avril_juin_2022_ccpe_karos'],
  ['Covoiturage multiopérateur 2022', 'covoiturage_multioperateur_2022'],
  ['Encourager financièrement le covoiturage', 'encourager_financierement_le_covoiturage'],
  ['Encourager financièrement le covoiturage - PMGV', 'encourager_financierement_le_covoiturage-pmgv'],
  [
    'Encourager financièrement le covoiturage - Pays de la Loire',
    'encourager_financierement_le_covoiturage-pays_de_la_loire',
  ],
  ["Expérimentation covoit'tan", 'experimentation_covoittan'],
  ['IDFM', 'idfm'],
  ['IDFM - Période normale', 'idfm-periode_normale'],
  ['JECOVOIT.2021', 'jecovoit_2021'],
  ['KLIMA - 2€ par trajet puis 0,1€/km', 'klima-2e_par_trajet_puis_01e_km'],
  ['KLIMA - Echelonné de 20 à 10 centimes/km', 'klima-echelonne_de_20_a_10_centimes_km'],
  ['Test', 'test'],
  ['Test de campagne', 'test_de_campagne'],
  ['covoiturage Arlysère', 'covoiturage_arlysere'],
  ['test 1', 'test_1'],
];

for (const [src, trg] of list) {
  test(`Sanitize ${src}`, (t) => {
    const provider = new APDFNameProvider();
    t.is(provider.sanitize(src), trg);
  });
}

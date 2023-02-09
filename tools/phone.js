const crypto = require('node:crypto');
const fs = require('node:fs/promises');

const operator_1 = process.env.OPERATOR_1_FILE ?? 'data_operator_1.csv';
const operator_2 = process.env.OPERATOR_2_FILE ?? 'data_operator_2.csv';
const operator_3 = process.env.OPERATOR_3_FILE ?? 'data_operator_3.csv';
const registry = process.env.REGISTRY_FILE ?? 'data_registry.csv';

const chunksize = 1_000_000;
const total_by_prefix = 100_000_000;

function* phone(prefix) {
  for(let i = 0; i < 10; i++) {
    const phone_str = `${prefix}${i.toString()}`;
    if (phone_str.length === 12) {
      yield phone_str;
    } else {
      yield* phone(phone_str);
    }
  }
}

async function main() {
  const operator_1_file = await fs.open(operator_1, 'a');
  const operator_2_file = await fs.open(operator_2, 'a');
  const operator_3_file = await fs.open(operator_3, 'a');
  const registry_file = await fs.open(registry, 'a');
  try {
    for (let prefix of ['+336', '+337']) {
      let data = [];
      let i = 0;
      for (let phoneStr of phone(prefix)) {
        data.push([phoneStr, crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()]);
        if (data.length >= chunksize) { 
          await operator_1_file.write(data.map(([nb, o1]) => [nb, o1].join(';')).join('\n'));
          await operator_2_file.write(data.map(([nb, _, o2]) => [nb, o2].join(';')).join('\n'));
          await operator_3_file.write(data.map(([nb, _, __, o3]) => [nb, o3].join(';')).join('\n'));
          await registry_file.write(data.map(([_, o1, o2, o3]) => [o1, o2, o3].join(';')).join('\n'));
          data = [];
          i += 1;
          console.log(`${Math.round(i * chunksize / total_by_prefix * 100)} per cent done for ${prefix}`);
        }
      }
    }
  } finally {
    await operator_1_file.close();
    await operator_2_file.close();
    await operator_3_file.close();
    await registry_file.close();
  }
}

main();

/**
 * From : https://github.com/blakeembrey/sql-template-tag/blob/v5.1.0/src/index.ts
 * By : Blake Embrey
 * Under : MIT
 *
 * Don't overwrite the additions by @author RPC, please.
 */

/**
 * Create a SQL object from an object of key-value pairs.
 * @author RPC
 */
export function fromObject(object: Record<string, RawValue>): Sql {
  const items: Sql[] = [];

  for (const [key, value] of Object.entries(object)) {
    items.push(sql`${raw(key)} = ${value}`);
  }

  return join(items);
}

// ---------------------------------------------------------------------------------------------------------------------
// UPDATE THE LIBRARY BELOW, NOT ABOVE THE LINE
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Values supported by SQL engine.
 * @author Blake Embrey
 */
export type Value = unknown;

/**
 * Supported value or SQL instance.
 * @author Blake Embrey
 */
export type RawValue = Value | Sql;

/**
 * A SQL instance can be nested within each other to build SQL strings.
 * @author Blake Embrey
 */
export class Sql {
  readonly values: Value[];
  readonly strings: string[];

  constructor(rawStrings: readonly string[], rawValues: readonly RawValue[]) {
    if (rawStrings.length - 1 !== rawValues.length) {
      if (rawStrings.length === 0) {
        throw new TypeError("Expected at least 1 string");
      }

      throw new TypeError(
        `Expected ${rawStrings.length} strings to have ${rawStrings.length - 1} values`,
      );
    }

    const valuesLength = rawValues.reduce<number>(
      (len, value) => len + (value instanceof Sql ? value.values.length : 1),
      0,
    );

    this.values = new Array(valuesLength);
    this.strings = new Array(valuesLength + 1);

    this.strings[0] = rawStrings[0];

    // Iterate over raw values, strings, and children. The value is always
    // positioned between two strings, e.g. `index + 1`.
    let i = 0,
      pos = 0;
    while (i < rawValues.length) {
      const child = rawValues[i++];
      const rawString = rawStrings[i];

      // Check for nested `sql` queries.
      if (child instanceof Sql) {
        // Append child prefix text to current string.
        this.strings[pos] += child.strings[0];

        let childIndex = 0;
        while (childIndex < child.values.length) {
          this.values[pos++] = child.values[childIndex++];
          this.strings[pos] = child.strings[childIndex];
        }

        // Append raw string to current string.
        this.strings[pos] += rawString;
      } else {
        this.values[pos++] = child;
        this.strings[pos] = rawString;
      }
    }
  }

  get text() {
    let i = 1,
      value = this.strings[0];
    while (i < this.strings.length) value += `$${i}${this.strings[i++]}`;
    return value;
  }

  get sql() {
    let i = 1,
      value = this.strings[0];
    while (i < this.strings.length) value += `?${this.strings[i++]}`;
    return value;
  }

  inspect() {
    return {
      text: this.text,
      sql: this.sql,
      values: this.values,
    };
  }
}

/**
 * Create a SQL query for a list of values.
 * @author Blake Embrey
 */
export function join(
  values: readonly RawValue[],
  separator = ",",
  prefix = "",
  suffix = "",
) {
  if (values.length === 0) {
    throw new TypeError(
      "Expected `join([])` to be called with an array of multiple elements, but got an empty array",
    );
  }

  return new Sql(
    [prefix, ...Array(values.length - 1).fill(separator), suffix],
    values,
  );
}

/**
 * Create a SQL query for a list of structured values.
 * @author Blake Embrey
 */
export function bulk(
  data: ReadonlyArray<ReadonlyArray<RawValue>>,
  separator = ",",
  prefix = "",
  suffix = "",
) {
  const length = data.length && data[0].length;

  if (length === 0) {
    throw new TypeError(
      "Expected `bulk([][])` to be called with a nested array of multiple elements, but got an empty array",
    );
  }

  const values = data.map((item, index) => {
    if (item.length !== length) {
      throw new TypeError(
        `Expected \`bulk([${index}][])\` to have a length of ${length}, but got ${item.length}`,
      );
    }

    return new Sql(["(", ...Array(item.length - 1).fill(separator), ")"], item);
  });

  return new Sql(
    [prefix, ...Array(values.length - 1).fill(separator), suffix],
    values,
  );
}

/**
 * Create raw SQL statement.
 * @author Blake Embrey
 */
export function raw(value: string) {
  return new Sql([value], []);
}

/**
 * Placeholder value for "no text".
 * @author Blake Embrey
 */
export const empty = raw("");

/**
 * Create a SQL object from a template string.
 * @author Blake Embrey
 */
export default function sql(
  strings: readonly string[],
  ...values: readonly RawValue[]
) {
  return new Sql(strings, values);
}

---
sidebar_position: 8
title: Exporting
---

# Exporting

Generated data is a plain object, so the simplest path is to hand it straight to your ORM:

```ts
const data = generate(schema, { seed: 42 });

await db.insert(usersTable).values(data.users);
await db.insert(ordersTable).values(data.orders);
```

When you'd rather write files — to commit fixtures, to feed a `psql` run, or to hand a dataset to someone without a Node process — use `exportAs`.

```ts
import { generate, exportAs } from 'linked-faker';

const data = generate(schema, { seed: 42 });

await exportAs(data, 'json', './seed-data.json');
await exportAs(data, 'csv', './seed-data/');
await exportAs(data, 'sql', './seed.sql', { dialect: 'postgres' });
```

`exportAs` is async and writes with `node:fs/promises`, so it runs on Node (or any runtime with that module) rather than in a browser.

## JSON

```ts
await exportAs(data, 'json', './seed-data.json');
```

One file, pretty-printed with two-space indentation, keyed by entity — the same shape `generate()` returned. `Date` values serialize to ISO strings.

```json
{
  "users": [
    { "id": "usr_1", "name": "Maria Garcia" }
  ],
  "orders": [
    { "id": "ord_1", "userId": "usr_1", "productIds": ["prd_2", "prd_9"] }
  ]
}
```

## CSV

```ts
await exportAs(data, 'csv', './seed-data/');
```

Here `outputPath` is a **directory**, not a file. It is created if missing, and each entity becomes `<entity>.csv` inside it.

```
seed-data/
  users.csv
  orders.csv
```

Columns are the union of every key across that entity's records, so a field that only some records carry still gets a column. Values containing a comma, quote, or newline are quoted, with inner quotes doubled. Arrays and objects — a `many` relation's id list, for instance — are written as JSON. `null` and `undefined` become empty cells.

```csv
id,userId,productIds
ord_1,usr_1,"[""prd_2"",""prd_9""]"
```

An entity with no records still gets an empty file, which keeps downstream loaders from failing on a missing path.

## SQL

```ts
await exportAs(data, 'sql', './seed.sql', { dialect: 'postgres' });
```

One file of `INSERT` statements, one statement per record, newline-separated. Entities are written in the order they appear in the dataset — which is the topological order `generate()` used — so parents are inserted before the rows that reference them.

```sql
INSERT INTO "users" ("id", "name") VALUES ('usr_1', 'Maria Garcia');
INSERT INTO "orders" ("id", "userId") VALUES ('ord_1', 'usr_1');
```

### Dialects

| `dialect` | Identifiers | Booleans |
|-----------|-------------|----------|
| `postgres` *(default)* | `"double quoted"` | `TRUE` / `FALSE` |
| `mysql` | `` `backticked` `` | `1` / `0` |
| `sqlite` | `"double quoted"` | `1` / `0` |

Omitting `dialect` gives you `postgres`.

### Literals

| Value | Emitted as |
|-------|-----------|
| `null`, `undefined` | `NULL` |
| finite `number` | bare number |
| `boolean` | per the dialect table above |
| object or array | JSON, as a quoted string |
| anything else | quoted string, with `'` doubled |

Entities with no records are skipped entirely — no empty statement block.

:::caution No schema DDL
`exportAs` emits `INSERT` statements only. The tables and columns must already
exist, and the column names come straight from your field names — so keep them
matching your real schema, or map them before exporting.
:::

## Round-tripping

Data written and read back can be re-checked against the schema:

```ts
import { readFile } from 'node:fs/promises';
import { validateGeneratedData } from 'linked-faker';

const data = JSON.parse(await readFile('./seed-data.json', 'utf8'));
const issues = validateGeneratedData(schema, data);
```

This catches a fixture file that drifted out of sync with a schema that has since changed. See [API → `validateGeneratedData`](./api.md#validategenerateddataschema-data).

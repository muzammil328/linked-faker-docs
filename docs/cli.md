---
sidebar_position: 7
title: CLI
---

# CLI

The package ships a `linked-faker` binary. It reads a config file, so the same schema drives your code and your terminal.

```bash
npx linked-faker init        # write a starter config
npx linked-faker inspect     # preview the graph and counts
npx linked-faker generate    # write the dataset to disk
npx linked-faker validate    # check foreign-key integrity
```

## The config file

`init` writes `linked-faker.config.ts`:

```bash
npx linked-faker init
npx linked-faker init --js       # linked-faker.config.mjs instead
npx linked-faker init --force    # overwrite an existing config
```

The config exports a schema, either directly or wrapped in an options object:

```ts
// linked-faker.config.ts
import { defineSchema } from 'linked-faker';

export default defineSchema({
  users: {
    count: 20,
    idPrefix: 'usr',
    fields: { name: 'person.fullName', email: 'internet.email' },
  },
  orders: {
    count: 80,
    idPrefix: 'ord',
    relations: { userId: { ref: 'users' } },
  },
});
```

```ts
// …or with defaults for the CLI flags
export default {
  schema: defineSchema({ /* … */ }),
  seed: 42,
  format: 'sql',
  out: './seed.sql',
  dialect: 'postgres',
};
```

A flag always beats the config value, and the config always beats the built-in default.

### Discovery

With no `--config`, these are tried in order:

```
linked-faker.config.ts
linked-faker.config.mts
linked-faker.config.js
linked-faker.config.mjs
linked-faker.config.cjs
linked-faker.config.json
```

Point at any other path with `--config`:

```bash
npx linked-faker generate --config ./seeds/demo.config.mjs
```

:::note TypeScript configs need jiti
A `.ts` config is transpiled with [jiti](https://github.com/unjs/jiti), which is
an optional peer dependency — install it with `npm i -D jiti`. A `.mjs` or
`.json` config loads with no extra dependency.
:::

## `inspect`

Prints the dependency graph, record counts, and relations — without generating anything. It is the fastest way to check a schema is wired the way you think.

```bash
npx linked-faker inspect
```

```
Dataset graph
────────────────
  categories · users
     ↓
  products
     ↓
  orders

Entities
────────────────
  categories  5
  users       20
  products    40
  orders      0–100   per users × 0–5
  ──────────────────
  Total       65–165

Relations
────────────────
  products.categoryId → categories.id
  orders.userId       → users.id       (from parent)
  orders.productIds   → products.id[]  (1–3)
```

Entities on the same line have no dependency between them and are generated in the same pass. Anything sized by `countPerParent` shows a range rather than a number, because its size depends on how many parents it gets.

Add `--json` for a machine-readable report — useful in CI, or for feeding a dashboard:

```bash
npx linked-faker inspect --json
```

```json
{
  "order": ["categories", "users", "products", "orders"],
  "layers": [["categories", "users"], ["products"], ["orders"]],
  "counts": { "users": { "min": 20, "max": 20 } },
  "total": { "min": 65, "max": 165 },
  "relations": [
    { "from": "orders", "field": "userId", "to": "users", "many": false }
  ]
}
```

## `generate`

Generates the dataset and writes it out.

```bash
npx linked-faker generate
npx linked-faker generate --seed 42
npx linked-faker generate --format sql --dialect postgres --out ./seed.sql
npx linked-faker generate --format csv --out ./seed-data/
```

| Flag | Default | Description |
|------|---------|-------------|
| `--seed <n>` | — | Reproducible output |
| `--format <fmt>` | `json` | `json`, `csv`, or `sql` |
| `--out <path>` | per format | `./seed-data.json`, `./seed-data/`, `./seed.sql` |
| `--dialect <d>` | `postgres` | `postgres`, `mysql`, or `sqlite` |
| `--stdout` | off | Write to stdout instead of a file |
| `--validate` | off | Check foreign keys before writing |

### Piping

`--stdout` writes the dataset to standard output and prints nothing else, so it composes with other tools:

```bash
npx linked-faker generate --stdout | jq '.users | length'
npx linked-faker generate --format sql --stdout | psql "$DATABASE_URL"
```

CSV is the exception — it produces one file per entity, so it has nowhere to go on stdout and the command errors instead.

### Checking before writing

`--validate` runs the same foreign-key checks as the `validate` command and refuses to write a broken dataset:

```bash
npx linked-faker generate --validate --format sql --out ./seed.sql
```

## `validate`

Generates in memory, checks every relation, and writes nothing. Exits `1` when something is wrong, so it drops straight into CI.

```bash
npx linked-faker validate --seed 42
```

```
Valid — 126 records, 3 relations, no broken references.
```

A failure names the offending records and finishes with a count per issue code:

```
Invalid dataset — 3 issues found.

  foreign_key orders[12].userId
    Relation "userId" points at "usr_99", which is not a generated users id.

  Summary
    foreign_key        3
```

The codes are the same ones `validateGeneratedData` returns — see [API](./api.md#validategenerateddataschema-data).

## `--count`

Every command that reads a schema accepts `--count`, which overrides entity sizes without touching the config. Handy for a quick smoke test, or for a one-off bulk load.

```bash
npx linked-faker generate --count 10000          # every fixed-count entity
npx linked-faker generate --count users=1000     # just one entity
npx linked-faker generate --count users=1000 --count orders=5000
```

The bare form hits **every** entity with a fixed `count`, which is rarely what you want on a multi-entity schema — the per-entity form usually is.

Entities sized by `countPerParent` are skipped by the bare form, since their size comes from a parent. Naming one explicitly is an error that tells you which parent to override instead:

```
Error: --count cannot override "orders": its size comes from countPerParent
(per "users"). Override that parent instead.
```

## In CI

```yaml
- run: npx linked-faker validate --seed 42
```

Catches a schema edit that breaks a relation, without committing a fixture. Pair it with `inspect --json` if you want to assert on counts too.

## All options

```
linked-faker init      [--out <path>] [--js] [--force]
linked-faker generate  [--seed <n>] [--count <n|entity=n>] [--format <fmt>]
                       [--out <path>] [--dialect <d>] [--stdout] [--validate]
linked-faker validate  [--seed <n>] [--count <n|entity=n>]
linked-faker inspect   [--count <n|entity=n>] [--json]

  -c, --config <path>    Config module
  -q, --quiet            Only print errors
  -h, --help             Show help
  -v, --version          Show the version
```

---
sidebar_position: 3
title: Schema
---

# Schema

A schema is a plain object passed to `defineSchema()`. Each top-level key is an **entity** — the equivalent of a database table — and its value is an entity config.

```ts
import { defineSchema } from 'linked-faker';

const schema = defineSchema({
  users: {
    count: 10,
    idPrefix: 'usr',
    fields: { name: 'person.fullName' },
    relations: {},
  },
});
```

## Entity options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `count` | `number` | — | How many records to generate. Required unless `countPerParent` is set. |
| `countPerParent` | `{ ref, min, max }` | — | Generate a variable number of records per parent record. See [Relations](./relations.md#cascading-counts). |
| `idPrefix` | `string` | derived from the entity name | Prefix for generated ids (`usr_1`, `usr_2`, …). |
| `fields` | `Record<string, FieldGenerator>` | `{}` | Field name → generator. See [Field Generators](./field-generators.md). |
| `relations` | `Record<string, RelationConfig>` | `{}` | Field name → relation config. See [Relations](./relations.md). |

`count` and `countPerParent` are mutually exclusive — set exactly one.

## IDs

Every generated record gets an `id` field automatically. You never declare it.

```ts
users: { count: 3 }
// → [{ id: 'use_1' }, { id: 'use_2' }, { id: 'use_3' }]
```

The default prefix is derived from the entity name: a trailing `s` is dropped and the result is truncated to three characters, so `users` becomes `use` and `orders` becomes `ord`. Names of three characters or fewer are used whole.

Set `idPrefix` when you want something more readable:

```ts
users:    { count: 3, idPrefix: 'usr' },   // usr_1, usr_2, usr_3
products: { count: 3, idPrefix: 'prd' },   // prd_1, prd_2, prd_3
```

Ids are sequential and start at `1`. An `id` entry in `fields` is ignored — the generated id always wins.

## Generation order

You do not need to declare entities in dependency order. `generate()` builds a dependency graph from every `relations` entry and every `countPerParent` ref, then walks it in topological order.

```ts
// Perfectly valid — orders is declared before the users it depends on
defineSchema({
  orders: { count: 50, relations: { userId: { ref: 'users' } } },
  users: { count: 10 },
});
```

A cycle in the graph is an error, reported with the entities involved.

## Validation at definition time

`defineSchema()` checks the schema before any data is generated, and throws on:

- an entity with neither `count` nor `countPerParent`
- a relation whose `ref` names an entity that doesn't exist (with a "did you mean…?" hint for near misses)
- a `many` relation with `min` below zero, or `max` below `min`
- `linkedToParent` on an entity that has no `countPerParent`
- a `linkedToParent` ref that disagrees with the `countPerParent` ref

```ts
defineSchema({
  users: { count: 5 },
  orders: { count: 10, relations: { userId: { ref: 'user' } } },
});
// Error: Entity "orders": relation "userId" references unknown entity "user". Did you mean "users"?
```

## TypeScript

`defineSchema` returns the schema, so you can keep it inline or export it:

```ts
import { defineSchema, type Schema } from 'linked-faker';

export const schema: Schema = defineSchema({ /* … */ });
```

Generated data is typed as `Record<string, Record<string, unknown>[]>`. Cast an entity array when you want a concrete shape:

```ts
const users = data.users as Array<{ id: string; name: string }>;
```

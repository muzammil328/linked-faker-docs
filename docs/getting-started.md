---
title: Getting Started
sidebar_position: 2
---

# Getting Started

## Install

```bash
npm install linked-faker
```

```bash
pnpm add linked-faker
```

Requires Node 18 or newer. Both ESM (`import`) and CJS (`require`) builds are published, and TypeScript types are bundled.

## 1. Describe your data

A schema is a plain object. Each top-level key is an **entity** — think of it as a table.

```ts
import { defineSchema } from 'linked-faker';

const schema = defineSchema({
  users: {
    count: 10,
    idPrefix: 'usr',
    fields: {
      name: 'person.fullName',
      email: 'internet.email',
      createdAt: 'date.past',
    },
  },
});
```

`defineSchema` validates the shape and throws on problems like an unknown `ref` or a missing `count`, so mistakes surface at definition time rather than halfway through generation.

## 2. Add a second entity and link them

```ts
const schema = defineSchema({
  users: {
    count: 10,
    idPrefix: 'usr',
    fields: { name: 'person.fullName' },
  },
  orders: {
    count: 50,
    idPrefix: 'ord',
    fields: { orderedAt: 'date.recent' },
    relations: {
      userId: { ref: 'users' },
    },
  },
});
```

`orders` is declared after `users` here, but order in the object doesn't matter — the dependency graph decides generation order.

## 3. Generate

```ts
import { generate } from 'linked-faker';

const data = generate(schema);

console.log(data.users[0]);
// { id: 'usr_1', name: 'Maria Garcia' }

console.log(data.orders[0]);
// { id: 'ord_1', orderedAt: 2026-09-04T11:22:31.000Z, userId: 'usr_7' }
```

Every `userId` matches a real id in `data.users`. Nothing is wired by hand.

## 4. Make it reproducible

```ts
const data = generate(schema, { seed: 42 });
```

Same schema plus same seed produces the same dataset on every run — which is what you want for fixtures and snapshot tests. Change the seed to get a different but equally valid dataset.

## 5. Get it into a database

Use the arrays directly with your ORM:

```ts
await db.insert(usersTable).values(data.users);
await db.insert(ordersTable).values(data.orders);
```

Or write files:

```ts
import { exportAs } from 'linked-faker';

await exportAs(data, 'sql', './seed.sql', { dialect: 'postgres' });
```

See **[Exporting](./exporting.md)** for the other formats.

## Next steps

- **[Schema](./schema.md)** — every entity option
- **[Relations](./relations.md)** — many-to-many, filters, and cascading counts

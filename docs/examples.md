---
sidebar_position: 8
title: Examples
---

# Examples

Complete schemas you can copy and adapt.

## E-commerce

Categories, products, users, and orders — the canonical shape, with a many-to-many between orders and products.

```ts
import { defineSchema, generate, oneOf, number, fixed } from 'linked-faker';

const schema = defineSchema({
  categories: {
    count: 6,
    idPrefix: 'cat',
    fields: {
      name: 'commerce.productName',
    },
  },

  products: {
    count: 40,
    idPrefix: 'prd',
    fields: {
      name: 'commerce.productName',
      price: 'commerce.price',
      inStock: 'datatype.boolean',
    },
    relations: {
      categoryId: { ref: 'categories' },
    },
  },

  users: {
    count: 25,
    idPrefix: 'usr',
    fields: {
      name: 'person.fullName',
      email: 'internet.email',
      role: fixed('customer'),
      joinedAt: 'date.past',
    },
  },

  orders: {
    count: 120,
    idPrefix: 'ord',
    fields: {
      status: oneOf(['pending', 'paid', 'shipped', 'cancelled']),
      quantity: number({ min: 1, max: 5 }),
      orderedAt: 'date.recent',
    },
    relations: {
      userId: { ref: 'users' },
      productIds: { ref: 'products', many: true, min: 1, max: 4 },
    },
  },
});

const data = generate(schema, { seed: 42 });
```

## Blog with cascading counts

Each author gets between zero and eight posts, and each post between zero and twelve comments — so the dataset has the lumpy distribution real data has, instead of a uniform one.

```ts
import { defineSchema, generate, oneOf } from 'linked-faker';

const schema = defineSchema({
  authors: {
    count: 8,
    idPrefix: 'aut',
    fields: {
      name: 'person.fullName',
      email: 'internet.email',
    },
  },

  posts: {
    countPerParent: { ref: 'authors', min: 0, max: 8 },
    idPrefix: 'pst',
    fields: {
      title: 'lorem.sentence',
      body: 'lorem.sentence',
      status: oneOf(['draft', 'published']),
      publishedAt: 'date.past',
    },
    relations: {
      authorId: { ref: 'authors', linkedToParent: true },
    },
  },

  comments: {
    countPerParent: { ref: 'posts', min: 0, max: 12 },
    idPrefix: 'cmt',
    fields: {
      body: 'lorem.sentence',
      createdAt: 'date.recent',
    },
    relations: {
      postId: { ref: 'posts', linkedToParent: true },
      authorId: { ref: 'authors' },
    },
  },
});

const data = generate(schema, { seed: 7 });

data.authors.length; // 8
data.posts.length;   // somewhere in 0…64
```

Note that `comments` carries two relations: `postId` links back to the parent it was generated for, while `authorId` picks any author — a comment is written by someone, not necessarily the post's author.

## Filtered relations

Only active users place orders, and only in-stock products get ordered.

```ts
import { defineSchema, generate, belongsTo, hasMany } from 'linked-faker';

const schema = defineSchema({
  users: {
    count: 30,
    idPrefix: 'usr',
    fields: {
      name: 'person.fullName',
      isActive: (_record, index) => index % 5 !== 0,
    },
  },

  products: {
    count: 20,
    idPrefix: 'prd',
    fields: {
      name: 'commerce.productName',
      inStock: (_record, index) => index % 3 !== 0,
    },
  },

  orders: {
    count: 60,
    idPrefix: 'ord',
    relations: {
      userId: belongsTo('users', { where: (u) => u.isActive === true }),
      productIds: hasMany('products', {
        min: 1,
        max: 3,
        where: (p) => p.inStock === true,
      }),
    },
  },
});

const data = generate(schema, { seed: 1 });
```

Using `index` rather than randomness for `isActive` and `inStock` keeps the filters deterministic under a seed — see the [note on custom functions](./field-generators.md#3-custom-functions).

## Derived fields

Later fields can read earlier ones on the same record, because fields resolve in declaration order.

```ts
const schema = defineSchema({
  users: {
    count: 10,
    idPrefix: 'usr',
    fields: {
      name: 'person.fullName',
      slug: (record) =>
        String(record.name).toLowerCase().replace(/\s+/g, '-'),
      initials: (record) =>
        String(record.name)
          .split(' ')
          .map((part) => part[0])
          .join(''),
      displayName: (record) => `${record.name} (${record.id})`,
    },
  },
});

// { id: 'usr_1', name: 'Maria Garcia', slug: 'maria-garcia',
//   initials: 'MG', displayName: 'Maria Garcia (usr_1)' }
```

`record.id` is available to every field — the id is assigned before any generator runs.

## Vitest fixture

A seeded dataset makes a stable fixture, so snapshots don't churn between runs.

```ts
// tests/fixtures.ts
import { defineSchema, generate } from 'linked-faker';

const schema = defineSchema({
  users: { count: 3, idPrefix: 'usr', fields: { name: 'person.fullName' } },
  orders: {
    count: 6,
    idPrefix: 'ord',
    relations: { userId: { ref: 'users' } },
  },
});

export const fixture = generate(schema, { seed: 1234 });
```

```ts
// tests/orders.test.ts
import { expect, test } from 'vitest';
import { fixture } from './fixtures';

test('every order belongs to a real user', () => {
  const userIds = new Set(fixture.users.map((u) => u.id));
  for (const order of fixture.orders) {
    expect(userIds.has(order.userId)).toBe(true);
  }
});

test('dataset is stable', () => {
  expect(fixture.orders).toMatchSnapshot();
});
```

## Validating in CI

Guard against a schema change that quietly breaks a relation.

```ts
import { defineSchema, generate } from 'linked-faker';
import { schema } from './schema';

const result = generate(schema, { seed: 42, validate: true });

if (!result.valid) {
  for (const issue of result.validation) {
    console.error(`[${issue.code}] ${issue.entity}: ${issue.message}`);
  }
  process.exit(1);
}

console.log('Schema generates valid data.');
```

## Seeding a Postgres database

```ts
import { generate, exportAs } from 'linked-faker';
import { schema } from './schema';

const data = generate(schema, { seed: 42 });

await exportAs(data, 'sql', './seed.sql', { dialect: 'postgres' });
```

```bash
psql "$DATABASE_URL" -f ./seed.sql
```

Tables must already exist — `exportAs` writes `INSERT` statements, not DDL. See [Exporting](./exporting.md#sql).

---
sidebar_position: 4
title: Relations
---

# Relations

Relations are what turn a pile of random fields into a coherent dataset. Each entry under `relations` declares a field whose value is drawn from the ids of another entity — and every value is guaranteed to reference a record that actually exists.

## Belongs-to

The default: one record points at one parent.

```ts
orders: {
  count: 50,
  idPrefix: 'ord',
  relations: {
    userId: { ref: 'users' },
  },
}
// orders[0] → { id: 'ord_1', userId: 'usr_7' }
```

Parents are picked at random, so some users end up with several orders and some with none.

## Many-to-many

Set `many: true` to get an array of ids, and bound the size with `min` and `max`.

```ts
orders: {
  count: 50,
  relations: {
    productIds: { ref: 'products', many: true, min: 1, max: 4 },
  },
}
// orders[0] → { id: 'ord_1', productIds: ['prd_2', 'prd_9'] }
```

`min` defaults to `1`, and `max` defaults to `min`, so `{ ref: 'products', many: true }` gives exactly one id in an array. The picked ids are distinct within a record.

## Filtered relations

Restrict which parents are eligible with `filter`:

```ts
users: {
  count: 20,
  idPrefix: 'usr',
  fields: {
    isActive: (_record, index) => index % 4 !== 0,
  },
},
orders: {
  count: 50,
  relations: {
    userId: {
      ref: 'users',
      filter: (user) => user.isActive === true,
    },
  },
}
```

The filter receives the full parent record. If it matches nothing, generation fails rather than silently emitting a dangling id.

## Cascading counts

`countPerParent` generates a variable number of children for each parent — the natural way to say "every user has between zero and five orders".

```ts
users: {
  count: 10,
  idPrefix: 'usr',
},
orders: {
  countPerParent: { ref: 'users', min: 0, max: 5 },
  idPrefix: 'ord',
  fields: { orderedAt: 'date.recent' },
  relations: {
    userId: { ref: 'users', linkedToParent: true },
  },
}
```

`linkedToParent: true` tells the relation to use *the parent this record was generated for* instead of picking a random one. Without it the child count would follow the parent, but the foreign key wouldn't point back at that same parent.

Two rules `defineSchema` enforces:

- `linkedToParent` requires `countPerParent` on the same entity
- the `linkedToParent` ref must match the `countPerParent` ref

## Helper functions

The same relations can be written with helpers, which is often tidier:

```ts
import { belongsTo, hasMany, fromParent } from 'linked-faker';

relations: {
  userId: belongsTo('users'),
  activeUserId: belongsTo('users', { where: (u) => u.isActive === true }),
  productIds: hasMany('products', { min: 1, max: 4 }),
  parentUserId: fromParent('users'),
}
```

| Helper | Equivalent to |
|--------|---------------|
| `belongsTo(ref)` | `{ ref }` |
| `belongsTo(ref, { where })` | `{ ref, filter: where }` |
| `hasMany(ref, { min, max, where })` | `{ ref, many: true, min, max, filter: where }` |
| `fromParent(ref)` | `{ ref, linkedToParent: true }` |

## Multi-level graphs

Relations chain as deep as you need. Categories feed products, products feed orders:

```ts
const schema = defineSchema({
  categories: {
    count: 5,
    idPrefix: 'cat',
    fields: { name: 'commerce.productName' },
  },
  products: {
    count: 30,
    idPrefix: 'prd',
    fields: { name: 'commerce.productName' },
    relations: { categoryId: { ref: 'categories' } },
  },
  orders: {
    count: 100,
    idPrefix: 'ord',
    relations: {
      productIds: { ref: 'products', many: true, min: 1, max: 3 },
    },
  },
});
```

## Checking the result

Pass `validate: true` to have every relation re-checked after generation:

```ts
const result = generate(schema, { seed: 42, validate: true });

result.valid;      // boolean
result.validation; // ValidationIssue[]
result.data;       // the dataset
```

Issues carry a `code` — `foreign_key`, `duplicate_id`, `many_relation`, `filter`, `parent_link`, or `count_per_parent` — plus the entity and a human-readable message. See [API](./api.md#validategenerateddataschema-data).

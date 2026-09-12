---
sidebar_position: 5
title: Field Generators
---

# Field Generators

Everything under an entity's `fields` is a **field generator**. Four forms are accepted, and they can be mixed freely within one entity.

```ts
import { defineSchema, faker, oneOf, number, fixed } from 'linked-faker';

defineSchema({
  users: {
    count: 10,
    fields: {
      name: 'person.fullName',                     // 1. built-in path
      status: oneOf(['active', 'invited']),        // 2. helper descriptor
      username: (_record, index) => `user_${index}`, // 3. custom function
      role: fixed('customer'),                     // 4. static value
    },
  },
});
```

## 1. Built-in generator paths

A bare string is looked up in the built-in generator table.

| Path | Returns | Example |
|------|---------|---------|
| `person.fullName` | `string` | `"Maria Garcia"` |
| `internet.email` | `string` | `"maria.garcia4821@example.com"` |
| `commerce.productName` | `string` | `"Wireless Keyboard"` |
| `commerce.price` | `number` | `129.4` |
| `date.recent` | `Date` | within 7 days before the reference date |
| `date.past` | `Date` | within a year before the reference date |
| `date.future` | `Date` | within a year after the reference date |
| `string.uuid` | `string` | `"3f2a…"` (v4 shape) |
| `datatype.boolean` | `boolean` | `true` |
| `lorem.word` | `string` | `"tempor"` |
| `lorem.sentence` | `string` | `"Dolor sit amet consectetur."` |

Get the list at runtime with `listGeneratorPaths()`:

```ts
import { listGeneratorPaths } from 'linked-faker';

listGeneratorPaths(); // ['commerce.price', 'commerce.productName', …]
```

An unrecognized path throws, with the valid alternatives named in the message:

```
Unknown generator path: "person.firstName". Use a built-in path, helper
(oneOf, number, email), or a custom function.
```

:::caution A bare string is always a path, never a literal
`role: 'customer'` will throw, because `customer` is not a generator path. For a
literal string use `fixed('customer')` or `stringValue('customer')`. Numbers,
booleans, and `null` *are* passed through as-is — the special case is strings.
:::

## 2. Helper descriptors

Helpers build the same descriptors more explicitly, and give you parameters that paths can't express.

| Helper | Result |
|--------|--------|
| `faker(path)` | The built-in generator at `path` — the explicit form of a bare string |
| `oneOf(values)` | One value picked at random from the array |
| `number({ min, max })` | Random integer, inclusive of both bounds |
| `float({ min, max })` | Random number rounded to two decimal places |
| `boolean(value?)` | `value` if given, otherwise a random boolean |
| `fixed(value)` | `value`, unchanged, of any type |
| `stringValue(value?)` | `value` if given, otherwise `string_<index>` |
| `uuid()` | Same as `faker('string.uuid')` |
| `email()` | Same as `faker('internet.email')` |
| `fullName()` | Same as `faker('person.fullName')` |
| `productName()` | Same as `faker('commerce.productName')` |
| `dateRecent()` | Same as `faker('date.recent')` |
| `datePast()` | Same as `faker('date.past')` |

```ts
import { oneOf, number, float, boolean, uuid } from 'linked-faker';

fields: {
  externalId: uuid(),
  status: oneOf(['pending', 'paid', 'cancelled']),
  quantity: number({ min: 1, max: 10 }),
  total: float({ min: 9.99, max: 499.99 }),
  isGift: boolean(),
}
```

## 3. Custom functions

A function receives the record built so far and its zero-based index, and returns the field value. Fields are resolved in declaration order, so a later field can read an earlier one.

```ts
fields: {
  firstName: 'person.fullName',
  slug: (record, index) => `${String(record.firstName).toLowerCase()}-${index}`,
  isActive: (_record, index) => index % 4 !== 0,
}
```

Use this for anything derived — slugs, totals, conditional flags, or values pulled from your own fixtures.

:::note Custom functions are outside the seeded RNG
`seed` controls the built-in generators. A function that calls `Math.random()`
or `Date.now()` will produce different output on every run, even with a fixed
seed. Derive from `record` and `index` when you need reproducibility.
:::

## 4. Static values

Numbers, booleans, and `null` are used verbatim:

```ts
fields: {
  version: 1,
  isArchived: false,
  deletedAt: null,
}
```

For a static **string**, wrap it — see the caution above:

```ts
fields: {
  role: fixed('customer'),
  source: stringValue('seed-script'),
}
```

## Seeding

Pass `seed` to `generate()` and every built-in generator and helper becomes deterministic:

```ts
const a = generate(schema, { seed: 42 });
const b = generate(schema, { seed: 42 });
// a and b are identical

const c = generate(schema, { seed: 43 });
// different dataset, same shape
```

Without a seed, output is random on each run.

### Seeding also pins the date reference

The `date.*` generators are relative to a **reference date**. Unseeded, that
reference is "now", so `date.recent` really does mean the last seven days.
Seeded, it is pinned to `2020-01-01T00:00:00.000Z` — otherwise the same seed
would produce different timestamps tomorrow, and reproducibility would be a
lie.

```ts
generate(schema, { seed: 42 });
// orders[0].orderedAt → 2019-12-28T04:11:36.000Z (a Date, within 7 days of 2020-01-01)
```

If you need seeded data anchored to today, compute the field yourself:

```ts
fields: {
  orderedAt: (_record, index) => new Date(Date.now() - index * 86_400_000),
}
```

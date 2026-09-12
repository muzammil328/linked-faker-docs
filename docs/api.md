---
sidebar_position: 6
title: API
---

# API

Everything below is exported from the package root:

```ts
import { defineSchema, generate, exportAs /* … */ } from 'linked-faker';
```

## `defineSchema(schema)`

```ts
function defineSchema(schema: Schema): Schema
```

Validates the schema and returns it unchanged. Throws on unknown relation refs, missing counts, contradictory `linkedToParent` config, and out-of-range `min`/`max`. See [Schema → Validation at definition time](./schema.md#validation-at-definition-time).

Calling it is optional in the sense that `generate()` accepts any conforming object — but running it means mistakes surface where the schema is written rather than where it is used.

## `generate(schema, options?)`

```ts
function generate<O extends GenerateOptions | undefined>(
  schema: Schema,
  options?: O,
): GenerateReturn<O>
```

Generates the dataset. Entities are produced in topological order, so declaration order in the schema is irrelevant.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `seed` | `number` | — | Makes output deterministic and pins the `date.*` reference to `2020-01-01T00:00:00.000Z`. |
| `validate` | `boolean` | `false` | Re-check the generated data and return a `GenerateResult` instead of the bare dataset. |

### Return value

The return type depends on `validate`, so no cast is needed:

```ts
const data = generate(schema);
// GeneratedData — { users: [...], orders: [...] }

const result = generate(schema, { validate: true });
// GenerateResult — { data, validation, valid }
```

```ts
const data = generate(schema, { seed: 42 });

data.users;     // Record<string, unknown>[]
data.users[0];  // { id: 'usr_1', name: 'Maria Garcia' }
```

:::note Exported as `generate`, implemented as `generateFromSchema`
The package re-exports `generateFromSchema` under the name `generate`. Import
`generate` — the other name is an internal detail.
:::

## `validateGeneratedData(schema, data)`

```ts
function validateGeneratedData(
  schema: Schema,
  data: GeneratedData,
): ValidationIssue[]
```

Checks an already-generated dataset against its schema and returns the problems it finds. An empty array means the data is sound. Useful when the data has passed through a transform, a round-trip to disk, or hand-editing.

```ts
import { generate, validateGeneratedData } from 'linked-faker';

const data = generate(schema, { seed: 42 });
const issues = validateGeneratedData(schema, data);

if (issues.length > 0) {
  console.error(issues);
}
```

Note the argument order: **schema first, data second**.

### `ValidationIssue`

```ts
interface ValidationIssue {
  code:
    | 'foreign_key'
    | 'duplicate_id'
    | 'many_relation'
    | 'filter'
    | 'parent_link'
    | 'count_per_parent';
  message: string;
  entity: string;
  details?: {
    recordIndex?: number;
    field?: string;
    value?: unknown;
    relationRef?: string;
  };
}
```

| Code | Means |
|------|-------|
| `foreign_key` | A relation value doesn't match any id in the referenced entity |
| `duplicate_id` | Two records in one entity share an id |
| `many_relation` | A `many` relation's array size falls outside `min`/`max`, or repeats an id |
| `filter` | A related record doesn't satisfy the relation's `filter` |
| `parent_link` | A `linkedToParent` value doesn't point at the record's own parent |
| `count_per_parent` | A parent's child count falls outside its `countPerParent` range |

## `exportAs(data, format, outputPath, options?)`

```ts
function exportAs(
  data: GeneratedData,
  format: 'json' | 'csv' | 'sql',
  outputPath: string,
  options?: { dialect?: 'postgres' | 'mysql' | 'sqlite' },
): Promise<void>
```

Writes the dataset to disk. See [Exporting](./exporting.md) for output shapes and escaping rules.

## `listGeneratorPaths()`

```ts
function listGeneratorPaths(): string[]
```

Returns every built-in generator path, sorted. Handy for building a picker, or for asserting in a test that a path you rely on still exists.

## Field helpers

All return a descriptor for use inside `fields`. See [Field Generators](./field-generators.md#2-helper-descriptors).

```ts
faker(path)            oneOf(values)          number({ min, max })
float({ min, max })    boolean(value?)        fixed(value)
stringValue(value?)    uuid()                 email()
fullName()             productName()          dateRecent()
datePast()
```

## Relation helpers

All return a relation config for use inside `relations`. See [Relations → Helper functions](./relations.md#helper-functions).

```ts
belongsTo(ref, { where? })
hasMany(ref, { min?, max?, where? })
fromParent(ref)
```

## `entity(config)`

```ts
function entity<T extends Record<string, unknown>>(config: T): T
```

An identity function that preserves the literal type of an entity config. Use it to define an entity separately without losing inference:

```ts
import { entity, defineSchema } from 'linked-faker';

const users = entity({
  count: 10,
  idPrefix: 'usr',
  fields: { name: 'person.fullName' },
});

const schema = defineSchema({ users });
```

## Exported types

```ts
import type {
  CountPerParentConfig,
  EntityConfig,
  ExportFormat,
  ExportOptions,
  FieldGenerator,
  FieldGeneratorDescriptor,
  GeneratedData,
  GenerateOptions,
  GenerateResult,
  GenerateReturn,
  RelationConfig,
  Schema,
  SqlDialect,
  ValidationIssue,
} from 'linked-faker';
```

| Type | Shape |
|------|-------|
| `Schema` | `Record<string, EntityConfig>` |
| `EntityConfig` | `{ count?, countPerParent?, idPrefix?, fields?, relations? }` |
| `RelationConfig` | `{ ref, many?, min?, max?, filter?, linkedToParent? }` |
| `CountPerParentConfig` | `{ ref, min, max }` |
| `FieldGenerator` | `string \| number \| boolean \| null \| FieldGeneratorDescriptor \| ((record, index) => unknown)` |
| `GeneratedData` | `Record<string, Record<string, unknown>[]>` |
| `GenerateOptions` | `{ seed?, validate? }` |
| `GenerateResult` | `{ data, validation, valid }` |
| `GenerateReturn<O>` | `GenerateResult` when `O` has `validate: true`, else `GeneratedData` |
| `ExportFormat` | `'json' \| 'csv' \| 'sql'` |
| `SqlDialect` | `'postgres' \| 'mysql' \| 'sqlite'` |

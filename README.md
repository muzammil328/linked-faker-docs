# linked-faker-docs

Documentation site for [**linked-faker**](https://www.npmjs.com/package/linked-faker) — generate realistic, relational fake data with valid foreign keys from a declarative schema.

Built with [Docusaurus](https://docusaurus.io/).

## Develop

```bash
pnpm install
pnpm start
```

Starts a dev server on <http://localhost:3000> with hot reload.

## Build

```bash
pnpm build
pnpm serve
```

`build` writes a static site to `build/`; `serve` previews it locally.

## Structure

```
docs/            Markdown pages, ordered by sidebar_position
sidebars.ts      Sidebar order
src/pages/       Homepage
src/components/  Homepage feature cards
src/css/         Brand tokens (--lf-*) and theme overrides
static/img/      Logo and favicon
```

## Editing content

Each page in `docs/` carries `sidebar_position` frontmatter that sets its place in the sidebar, and `sidebars.ts` lists the pages explicitly — add a new page in both.

The package source lives in the sibling [`linked-faker-npm`](../linked-faker-npm) folder. When the API changes there, the pages to check are `docs/api.md`, `docs/field-generators.md`, and `docs/exporting.md`.

## License

MIT

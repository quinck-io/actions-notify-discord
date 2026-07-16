# Contributing

## Project layout

-   `src/` TypeScript source
-   `dist/main.js` the bundled action entry point, committed to the repo
-   `action.yaml` the action definition (runs `dist/main.js` with `node24`)

## Development

The action runs the bundled `dist/main.js` directly from the repo, so the bundle must be committed and always match `src/`.

-   `npm install` rebuilds `dist/main.js` automatically (via the `prepare` script)
-   `npm run build` rebuilds it on demand
-   `npm run lint` runs eslint, `npm run lint:fix` autofixes

Always commit `src/` and the rebuilt `dist/` together. The `Check dist` workflow rebuilds the bundle on every PR and fails if the committed `dist/` does not match, so a stale bundle cannot be merged.

## Releasing

1.  bump `version` in `package.json`
2.  rebuild if `src/` changed (`npm run build`) and commit `src/` + `dist/` together
3.  merge to `main`
4.  run the `Release` workflow from the Actions tab (or `gh workflow run release.yaml --ref main`)

The `Release` workflow reads the version from `package.json`, tags the current `main` commit as `vX.Y.Z`, and moves the floating major tag (`vX`) to it. It refuses to run if the `vX.Y.Z` tag already exists, so bump the version before releasing.

Consumers can pin either the exact tag or the major tag:

```yaml
uses: quinck-io/actions-notify-discord@v4     # latest v4.x.x
uses: quinck-io/actions-notify-discord@v4.0.0 # exact
```

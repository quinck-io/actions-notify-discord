/* eslint-disable */

import { build } from 'esbuild'

build({
    entryPoints: [`src/main.ts`],
    outfile: `dist/main.js`,
    bundle: true,
    platform: 'node',
    logLevel: 'info',
}).catch(() => process.exit(1))

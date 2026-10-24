import { build } from 'esbuild'

// Bundle so code imported from ../shared is inlined; `firebase deploy` uploads
// only this directory. Runtime dependencies stay external and are installed by
// Cloud Build from package.json.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: true,
  packages: 'external',
  alias: { '@shared': '../shared' },
})

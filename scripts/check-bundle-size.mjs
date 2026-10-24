// Fails if the JS loaded on first paint exceeds the budget (gzip). Run after `npm run build`.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = 250
const html = readFileSync('dist/index.html', 'utf8')
const scripts = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1])
let total = 0
for (const file of scripts) {
  const kb = gzipSync(readFileSync(join('dist', file))).length / 1024
  total += kb
  console.log(`${file}: ${kb.toFixed(1)} KB gzip`)
}
console.log(`Initial JS: ${total.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB)`)
if (total > BUDGET_KB) {
  console.error('Bundle budget exceeded. Lazy-load the heavy route or dependency.')
  process.exit(1)
}

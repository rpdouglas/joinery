// Usage: node scripts/verify-firebase-alias.mjs <alias> <expected-project-id>
// Every deploy runs this first so a wrong alias can never ship to the wrong project.
import { readFileSync } from 'node:fs'

const [alias, expected] = process.argv.slice(2)
if (!alias || !expected) {
  console.error('Usage: verify-firebase-alias.mjs <alias> <expected-project-id>')
  process.exit(2)
}
const { projects } = JSON.parse(readFileSync('.firebaserc', 'utf8'))
const actual = projects?.[alias]
if (actual !== expected) {
  console.error(
    `Alias "${alias}" points at "${actual}", expected "${expected}". Refusing to deploy.`,
  )
  process.exit(1)
}
console.log(`Alias "${alias}" -> ${actual} verified.`)

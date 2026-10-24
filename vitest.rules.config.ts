import { defineConfig } from 'vitest/config'

// Security-rules tests. Run through `npm run test:rules`, which starts the emulators first.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    fileParallelism: false,
  },
})

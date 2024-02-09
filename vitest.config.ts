/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Will call .mockClear() on all spies before each test.
    // This will clear mock history, but not reset its implementation to the default one.
    clearMocks: true,
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

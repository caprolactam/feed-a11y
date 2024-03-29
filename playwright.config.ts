import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cross-env STORYBOOK_E2E=1 npm run storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    //   {
    //     name: 'firefox',
    //     use: { ...devices['Desktop Firefox'] },
    //   },
    //   {
    //     name: 'webkit',
    //     use: { ...devices['Desktop Safari'] },
    //   },
  ],
})

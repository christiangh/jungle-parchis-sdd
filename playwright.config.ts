import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const CI = !!process.env['CI'];

// Browser tests: smoke test (RF-016), game scenarios (RF-023) and screen fit (CE-08). Run with
// `pnpm test:e2e`, outside `pnpm check`.
export default defineConfig({
  testDir: './e2e',
  forbidOnly: CI,
  // No retries: a retry would hide a flaky test (P-09).
  retries: 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Own server with the production build, never one already running.
  webServer: {
    command: `pnpm ng serve --configuration production --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

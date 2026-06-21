import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright',
  timeout: 5000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  webServer: {
    command: 'npm start',
    port: 4200,
    reuseExistingServer: true
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    // { name: 'firefox', use: { browserName: 'firefox' } },
    // { name: 'webkit', use: { browserName: 'webkit' } },
    // { name: 'mobile-safari', use: { ...devices['iPhone 14'] } }
  ],
  workers: '100%'
});

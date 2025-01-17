import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //  Dockerコンテナ内でテストする場合、デフォルトではIPv6からしか接続を受け付けないっぽかったのでhostを指定
  reporter: [['html', { host: '0.0.0.0', port: '9323' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    //  Googleからリダイレクトで戻るのはlocalhostなので、127.0.0.1からログイン処理を始めるとドメインが異なることによってCookieが無くてエラーになる
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    //  テスト失敗時に動画やtraceなどを撮るように
    trace: 'retain-on-failure',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      //  参考: https://playwright.dev/docs/next/auth#basic-shared-account-in-all-tests
      //  dependenciesによってsetupがまず実行され、完了時にContextが保存される
      //  他環境では保存したContextを再利用することでログインが不要になる
      name: 'setup',
      testMatch: /setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          //  Googleのログインは自動化されたブラウザだと不可と言われるので、実際のブラウザを起動（非headless）
          //  WSLgのソケットをコンテナと共有することで、コンテナ内からのテストも行えた。
          //  CIを実施する際はX Windowがサポートされている環境じゃないとダメそう
          headless: false,
          args: [
            //  同上の理由により起動時オプションで自動処理（？）を無効化
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        //  Contextを再利用する
        storageState: 'playwright/.auth/user.json',
      },
      //  依存関係が無いと並列でテストが走るので、playwright/.auth/user.jsonが作られる前にテストが実施されてしまう
      dependencies: ['setup'],
    },
    // そもそもFirefoxは動作対象外なのでログインボタンが出てこない
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    //
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    //
    // // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    //
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
})

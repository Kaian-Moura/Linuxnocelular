import {defineConfig} from '@playwright/test';
const subpath=process.env.DOCUSAURUS_TEST_SUBPATH==='1';
const port=subpath?4174:4173;
export default defineConfig({
  testDir:'./tests/browser',
  timeout:30000,
  fullyParallel:false,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:`http://127.0.0.1:${port}`, trace:'retain-on-failure', screenshot:'only-on-failure', launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}},
  webServer:{command:`npm run serve -- --dir ${subpath?'build-subpath':'build'} --port ${port}`,url:`http://127.0.0.1:${port}${process.env.DOCUSAURUS_BASE_URL||'/'}`,reuseExistingServer:!process.env.CI,timeout:60000},
});

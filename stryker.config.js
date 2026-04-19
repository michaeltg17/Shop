/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    'src/app/**/*.ts',
    '!src/**/*.spec.ts'
  ],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js'
  },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'off',
  tsconfigFile: 'tsconfig.json',
  cleanTempDir: 'always',
};

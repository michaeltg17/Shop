/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

export default {
    ...createCjsPreset(),
    testPathIgnorePatterns: ['<rootDir>/playwright/', '<rootDir>/.stryker-tmp'],
    coverageReporters: ['json-summary', 'lcov', 'text', 'clover'],
    coverageThreshold: {
        global: {
            branches: 87,
            functions: 95,
            lines: 95,
            statements: 95
        }
    },
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts']
} satisfies Config;

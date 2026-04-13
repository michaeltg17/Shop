import { test as base } from '@playwright/test';

export const test = base.extend({
  context: async ({ context }, use) => {
    const mutantId = process.env.__STRYKER_ACTIVE_MUTANT__;

    await context.addInitScript(id => {
      (window as any).process = {
        env: { __STRYKER_ACTIVE_MUTANT__: id }
      };
    }, mutantId);

    await use(context);
  }
});

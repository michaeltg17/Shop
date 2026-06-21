import { expect, Page } from '@playwright/test';
import { test } from './fixtures';

async function clickRowById(page: Page, id: string | number) {
  const rows = page.locator('tr[mat-row]');
  // Match by exact ID cell content (column 2 = id)
  const idCellText = String(id);
  const targetByCell = rows.filter({
    has: page.locator('td:nth-child(2)').filter({ hasText: idCellText, exact: true }),
  }).first();
  const target = rows.filter({ hasText: idCellText }).first();
  const visibleTarget = (await targetByCell.count()) > 0 ? targetByCell : target;
  await expect(visibleTarget).toBeVisible({ timeout: 10000 });
  await visibleTarget.click();
}

test('clicking a row opens view dialog with readonly fields', async ({ page }) => {
  await page.goto('/admin/users');
  await page.waitForSelector('tr[mat-row]');

  // click the row with id 2 (david morrison) — always on page 1
  await clickRowById(page, 2);

  // wait for dialog to appear and assert title
  await page.waitForSelector('mat-dialog-container');
  const title = page.locator('mat-dialog-container [mat-dialog-title]');
  await expect(title).toHaveText(/View User/i);

  // inputs should have readonly attribute
  const dialogContent = page.locator('mat-dialog-container mat-dialog-content');
  await expect(dialogContent.locator('input[readonly]')).toHaveCount(4);

  // checkbox should be disabled in view mode — check the internal input element
  const checkboxInput = dialogContent.locator('mat-checkbox input[type="checkbox"]');
  await expect(checkboxInput).toBeDisabled();

  // verify the dialog shows a valid user name (any of the first 5 users)
  await expect(dialogContent.locator('input').first()).toHaveValue(/john|david|kevin|don|derek/i);
});

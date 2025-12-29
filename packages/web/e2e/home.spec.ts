import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ホームページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Mermaid/i);
  });

  test('新規作成ボタンが存在する', async ({ page }) => {
    const newButton = page.locator('a[href="/editor"]');
    await expect(newButton).toBeVisible();
  });

  test('新規作成ボタンをクリックするとエディターページに遷移する', async ({ page }) => {
    const newButton = page.locator('a[href="/editor"]');
    await newButton.click();
    await expect(page).toHaveURL(/\/editor/);
  });

  test('ヘッダーが表示される', async ({ page }) => {
    const header = page.locator('h1');
    await expect(header).toBeVisible();
  });
});

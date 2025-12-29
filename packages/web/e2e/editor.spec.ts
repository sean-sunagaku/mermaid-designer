import { test, expect } from '@playwright/test';

test.describe('エディター基本機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
  });

  test('エディターページが正しく読み込まれる', async ({ page }) => {
    await expect(page).toHaveURL(/\/editor/);
  });

  test('キャンバスエリアが存在する', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('コードエディターエリアが存在する', async ({ page }) => {
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toBeVisible();
  });

  test('ツールバーが存在する', async ({ page }) => {
    const toolbar = page.locator('.toolbar');
    await expect(toolbar).toBeVisible();
  });

  test('エンティティ追加ボタンが存在する', async ({ page }) => {
    const addButton = page.locator('button.toolbar__button--primary');
    await expect(addButton).toBeVisible();
    await expect(addButton).toContainText(/Add Entity/i);
  });

  test('Undo/Redoボタンが存在する', async ({ page }) => {
    const undoButton = page.locator('button:has-text("Undo")');
    const redoButton = page.locator('button:has-text("Redo")');
    await expect(undoButton).toBeVisible();
    await expect(redoButton).toBeVisible();
  });

  test('初期状態でerDiagramヘッダーがコードに含まれる', async ({ page }) => {
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toHaveValue(/erDiagram/);
  });
});

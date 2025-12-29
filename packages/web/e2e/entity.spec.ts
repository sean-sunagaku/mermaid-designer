import { test, expect } from '@playwright/test';

test.describe('エンティティ操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
  });

  test('エンティティを追加できる', async ({ page }) => {
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();

    // エンティティノードが追加されたことを確認
    const entityNode = page.locator('.react-flow__node');
    await expect(entityNode.first()).toBeVisible();
  });

  test('エンティティを選択するとサイドパネルが表示される', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();

    // エンティティノードをクリック
    const entityNode = page.locator('.react-flow__node').first();
    await entityNode.click();

    // サイドパネルが表示されることを確認
    const sidePanel = page.locator('.side-panel');
    await expect(sidePanel).toBeVisible();
  });

  test('複数のエンティティを追加できる', async ({ page }) => {
    const addButton = page.locator('button.toolbar__button--primary');

    // 3つのエンティティを追加
    await addButton.click();
    await page.waitForTimeout(200);
    // キャンバスをクリックして選択解除
    await page.locator('.react-flow__pane').click();
    await page.waitForTimeout(100);

    await addButton.click();
    await page.waitForTimeout(200);
    await page.locator('.react-flow__pane').click();
    await page.waitForTimeout(100);

    await addButton.click();
    await page.waitForTimeout(200);

    // 3つのノードが存在することを確認
    const entityNodes = page.locator('.react-flow__node');
    await expect(entityNodes).toHaveCount(3);
  });

  test('エンティティ名を編集できる', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    // エンティティノードをクリック
    const entityNode = page.locator('.react-flow__node').first();
    await entityNode.click();
    await page.waitForTimeout(200);

    // サイドパネルの名前入力フィールドを編集
    const nameInput = page.locator('.side-panel__input').first();
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('Customer');
    await nameInput.press('Tab');

    await page.waitForTimeout(300);

    // 属性を追加（コードに反映させるために必要）
    const addAttrButton = page.locator('.side-panel button:has-text("+ Add")');
    await addAttrButton.click();
    await page.waitForTimeout(300);

    // 属性名を入力
    const attrNameInput = page.locator('.side-panel input[placeholder="name"]').first();
    await attrNameInput.fill('id');
    await attrNameInput.press('Tab');

    await page.waitForTimeout(500);

    // コードエディターに反映されることを確認
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toHaveValue(/Customer/);
  });

  test('属性を追加できる', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    // エンティティノードをクリック
    const entityNode = page.locator('.react-flow__node').first();
    await entityNode.click();
    await page.waitForTimeout(200);

    // 属性追加ボタンをクリック
    const addAttrButton = page.locator('.side-panel button:has-text("+ Add")');
    await expect(addAttrButton).toBeVisible();
    await addAttrButton.click();

    // 属性行が増えたことを確認（属性の入力フィールドが表示される）
    await page.waitForTimeout(300);
    const attrInput = page.locator('.side-panel input[placeholder="name"]');
    await expect(attrInput.first()).toBeVisible();
  });
});

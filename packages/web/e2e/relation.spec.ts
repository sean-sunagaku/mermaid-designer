import { test, expect } from '@playwright/test';

test.describe('リレーション操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    // 2つのエンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);
    await page.locator('.react-flow__pane').click();
    await page.waitForTimeout(100);
    await addButton.click();
    await page.waitForTimeout(200);
  });

  test('2つのエンティティが追加されている', async ({ page }) => {
    const entityNodes = page.locator('.react-flow__node');
    await expect(entityNodes).toHaveCount(2);
  });

  test('コードからリレーションを作成できる', async ({ page }) => {
    // コードエディターでリレーションを含むコードを入力
    const codeEditor = page.locator('.code-editor__textarea');
    await codeEditor.fill(`erDiagram
    CUSTOMER {
        int id PK
    }
    ORDER {
        int id PK
    }
    CUSTOMER ||--o{ ORDER : places`);

    await page.waitForTimeout(1000);

    // エッジが作成されたことを確認
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible();
  });

  test('リレーションを選択するとサイドパネルにリレーション編集UIが表示される', async ({
    page,
  }) => {
    // コードエディターでリレーションを含むコードを入力
    const codeEditor = page.locator('.code-editor__textarea');
    await codeEditor.fill(`erDiagram
    CUSTOMER {
        int id PK
    }
    ORDER {
        int id PK
    }
    CUSTOMER ||--o{ ORDER : places`);

    await page.waitForTimeout(1000);

    // エッジをクリック
    const edge = page.locator('.react-flow__edge').first();
    await edge.click({ force: true });
    await page.waitForTimeout(200);

    // サイドパネルが表示されることを確認
    const sidePanel = page.locator('.side-panel');
    await expect(sidePanel).toBeVisible();
  });
});

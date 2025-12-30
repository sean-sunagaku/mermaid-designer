import { test, expect } from '@playwright/test';

test.describe('コネクタ - 全方向ハンドル', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
  });

  test('エンティティノードに4つのハンドルが表示される', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    // ノード内のハンドルを確認（各方向に1つ、計4つ）
    const node = page.locator('.react-flow__node').first();
    const handles = node.locator('.react-flow__handle');
    await expect(handles).toHaveCount(4);
  });

  test('各方向にハンドルが存在する', async ({ page }) => {
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    const node = page.locator('.react-flow__node').first();

    // 各方向のハンドルが存在することを確認
    const positions = ['top', 'right', 'bottom', 'left'];
    for (const pos of positions) {
      const handle = node.locator(
        `.react-flow__handle[data-handlepos="${pos}"]`
      );
      await expect(handle).toBeVisible();
    }
  });

  test('ハンドルに正しいIDが設定されている', async ({ page }) => {
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    const node = page.locator('.react-flow__node').first();

    // 各ハンドルIDを確認
    const expectedHandleIds = ['top', 'right', 'bottom', 'left'];

    for (const handleId of expectedHandleIds) {
      const handle = node.locator(
        `.react-flow__handle[data-handleid="${handleId}"]`
      );
      await expect(handle).toBeVisible();
    }
  });

  test('コードからリレーションを作成するとエッジが表示される', async ({
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

    // エッジが作成されたことを確認
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible();

    // 2つのエンティティノードが表示されていることを確認
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(2);

    // 各ノードに4つのハンドルがあることを確認
    const firstNode = nodes.first();
    const secondNode = nodes.nth(1);
    await expect(firstNode.locator('.react-flow__handle')).toHaveCount(4);
    await expect(secondNode.locator('.react-flow__handle')).toHaveCount(4);
  });

  test('複数のリレーションを作成してもハンドルは正常に機能する', async ({
    page,
  }) => {
    // 複数のリレーションを含むコードを入力
    const codeEditor = page.locator('.code-editor__textarea');
    await codeEditor.fill(`erDiagram
    CUSTOMER {
        int id PK
    }
    ORDER {
        int id PK
    }
    PRODUCT {
        int id PK
    }
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ PRODUCT : contains`);

    await page.waitForTimeout(1000);

    // 3つのエンティティノードが表示されていることを確認
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(3);

    // 2つのエッジが表示されていることを確認
    const edges = page.locator('.react-flow__edge');
    await expect(edges).toHaveCount(2);
  });
});

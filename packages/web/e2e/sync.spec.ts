import { test, expect } from '@playwright/test';

test.describe('GUI ↔ コード同期', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
  });

  test('GUIでエンティティを追加するとコードに反映される', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(500);

    // コードエディターを確認
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toHaveValue(/erDiagram/);
  });

  test('コードを編集するとGUIに反映される', async ({ page }) => {
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toBeVisible();

    // コードを入力
    await codeEditor.fill(`erDiagram
    CUSTOMER {
        string name PK
        string email
    }
    ORDER {
        int id PK
        date created_at
    }
    CUSTOMER ||--o{ ORDER : places`);

    // しばらく待ってGUIに反映されるのを待つ
    await page.waitForTimeout(1000);

    // エンティティノードが2つ作成されたことを確認
    const entityNodes = page.locator('.react-flow__node');
    await expect(entityNodes).toHaveCount(2);
  });

  test('Undo/Redoボタンが存在してクリックできる', async ({ page }) => {
    // エンティティを追加
    const addButton = page.locator('button.toolbar__button--primary');
    await addButton.click();
    await page.waitForTimeout(200);

    // エンティティが追加されたことを確認
    const entityNodes = page.locator('.react-flow__node');
    await expect(entityNodes).toHaveCount(1);

    // Undoボタンが存在し、クリックできることを確認
    const undoButton = page.locator('button:has-text("Undo")');
    await expect(undoButton).toBeVisible();
    await undoButton.click();

    // Redoボタンが存在し、クリックできることを確認
    const redoButton = page.locator('button:has-text("Redo")');
    await expect(redoButton).toBeVisible();
    await redoButton.click();
  });

  test('複数のエンティティとリレーションを含むコードが正しくパースされる', async ({ page }) => {
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toBeVisible();

    // 複雑なERダイアグラムコードを入力
    await codeEditor.fill(`erDiagram
    USER {
        int id PK
        string name
        string email UK
    }
    POST {
        int id PK
        string title
        text content
        int user_id FK
    }
    COMMENT {
        int id PK
        text body
        int post_id FK
        int user_id FK
    }
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has`);

    await page.waitForTimeout(1000);

    // 3つのエンティティノードが作成されたことを確認
    const entityNodes = page.locator('.react-flow__node');
    await expect(entityNodes).toHaveCount(3);

    // 3つのリレーションエッジが作成されたことを確認
    const edges = page.locator('.react-flow__edge');
    await expect(edges).toHaveCount(3);
  });

  test('無効なコードを入力してもアプリがクラッシュしない', async ({ page }) => {
    const codeEditor = page.locator('.code-editor__textarea');
    await expect(codeEditor).toBeVisible();

    // 無効なコードを入力
    await codeEditor.fill(`erDiagram
    INVALID SYNTAX HERE {{{
    |||--->>><<<`);

    await page.waitForTimeout(500);

    // ページがまだ動作していることを確認
    await expect(page).toHaveURL(/\/editor/);

    // キャンバスがまだ表示されていることを確認
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });
});

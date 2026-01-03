import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const isWatch = process.argv.includes('--watch');

// Extension用ビルドオプション（Node.js環境）
const extensionBuildOptions = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  minify: !isWatch,
};

// Webview用ビルドオプション（ブラウザ環境）
const webviewBuildOptions = {
  entryPoints: ['./src/webview/webviewApp.tsx'],
  bundle: true,
  outfile: './webview-dist/webview.js',
  format: 'iife',
  platform: 'browser',
  sourcemap: true,
  minify: !isWatch,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'empty', // CSSは別途コピーするため空として扱う
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isWatch ? 'development' : 'production'
    ),
  },
};

// webview-distディレクトリを作成
if (!fs.existsSync('./webview-dist')) {
  fs.mkdirSync('./webview-dist', { recursive: true });
}

// coreパッケージのCSSをwebview-distにコピー
function copyCoreStyles() {
  // node_modules内のcoreパッケージからスタイルをコピー
  const possiblePaths = [
    path.resolve('./node_modules/@mermaid-er-editor/core/dist/styles.css'),
    path.resolve('../../node_modules/@mermaid-er-editor/core/dist/styles.css'),
    path.resolve('../core/dist/styles.css'),
    path.resolve('../core/dist/style.css'),
  ];

  const destPath = './webview-dist/webview.css';
  let copied = false;

  for (const srcPath of possiblePaths) {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log('Copied core styles from:', srcPath);
      copied = true;
      break;
    }
  }

  if (!copied) {
    console.warn('Warning: Core styles not found. Checked paths:', possiblePaths);
    // 空のCSSファイルを作成
    fs.writeFileSync(destPath, '/* Core styles not found */');
  }
}

if (isWatch) {
  // ウォッチモード
  const [extCtx, webviewCtx] = await Promise.all([
    esbuild.context(extensionBuildOptions),
    esbuild.context(webviewBuildOptions),
  ]);

  await Promise.all([extCtx.watch(), webviewCtx.watch()]);

  copyCoreStyles();
  console.log('Watching for changes...');
} else {
  // 通常ビルド
  await Promise.all([
    esbuild.build(extensionBuildOptions),
    esbuild.build(webviewBuildOptions),
  ]);

  copyCoreStyles();
  console.log('Build complete');
}

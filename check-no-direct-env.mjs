import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(repoRoot, 'src');
const allowedFile = path.normalize(
  path.join(srcRoot, 'config', 'env-config.ts'),
);
const directEnvPattern = /import\.meta\.env/;
const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);

const collectFiles = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }

    if (allowedExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
};

const files = await collectFiles(srcRoot);
const violations = [];

for (const filePath of files) {
  if (path.normalize(filePath) === allowedFile) {
    continue;
  }

  const content = await readFile(filePath, 'utf8');

  if (directEnvPattern.test(content)) {
    violations.push(path.relative(repoRoot, filePath));
  }
}

if (violations.length > 0) {
  console.error(
    'No se permite usar import.meta.env fuera de src/config/env-config.ts:\n' +
      violations.map((file) => `- ${file}`).join('\n'),
  );
  process.exit(1);
}

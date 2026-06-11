import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const files = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(js|jsx|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
};

walk(root);

let hasError = false;
for (const file of files) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
    console.log(`OK ${path.relative(root, file)}`);
  } catch (error) {
    hasError = true;
    console.error(`ERROR ${path.relative(root, file)}: ${error.message}`);
  }
}

process.exit(hasError ? 1 : 0);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.resolve(__dirname, '../src/i18n/messages');

function scanKeysForDots(obj, currentPath = '') {
  const errors = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    if (key.includes('.')) {
      errors.push({ key, fullPath });
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      errors.push(...scanKeysForDots(value, fullPath));
    }
  }
  return errors;
}

let hasFailures = false;
console.log('--- Validating next-intl translation keys for invalid literal dots ---');

if (!fs.existsSync(messagesDir)) {
  console.error(`Messages directory not found: ${messagesDir}`);
  process.exit(1);
}

const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const fullPath = path.join(messagesDir, file);
  try {
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const invalidKeys = scanKeysForDots(content);

    if (invalidKeys.length > 0) {
      hasFailures = true;
      console.error(`❌ [${file}] Found ${invalidKeys.length} invalid keys with literal '.' characters:`);
      invalidKeys.forEach(({ key, fullPath }) => {
        console.error(`   - Key: "${key}" (at ${fullPath})`);
      });
    } else {
      console.log(`✅ [${file}] Passed: All ${Object.keys(content).length} translation keys are valid.`);
    }
  } catch (err) {
    hasFailures = true;
    console.error(`❌ [${file}] Failed to parse JSON:`, err.message);
  }
}

if (hasFailures) {
  console.error('\nTranslation validation FAILED. Remove all literal dots from translation key names.');
  process.exit(1);
} else {
  console.log('\nAll translation files are valid and free of literal dot keys!');
}

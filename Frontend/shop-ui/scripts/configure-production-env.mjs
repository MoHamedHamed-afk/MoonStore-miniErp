import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const targetFile = resolve(projectRoot, 'src/environments/environment.production.ts');
const configuredApiUrl = process.env.API_BASE_URL?.trim();
const apiBaseUrl = configuredApiUrl || 'https://moonstore-backend-free.onrender.com';

const fileContents = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl.replace(/'/g, "\\'")}'
};
`;

mkdirSync(dirname(targetFile), { recursive: true });
writeFileSync(targetFile, fileContents, 'utf8');

console.log(`Prepared production environment with apiBaseUrl=${apiBaseUrl}`);

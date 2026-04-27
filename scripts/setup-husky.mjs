import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!existsSync('.git')) {
  console.log('Skipping husky setup: .git directory not found.');
  process.exit(0);
}

const result = spawnSync('pnpm', ['exec', 'husky'], { stdio: 'inherit', shell: true });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

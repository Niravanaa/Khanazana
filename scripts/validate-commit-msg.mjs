import { readFileSync } from 'node:fs';

const commitFilePath = process.argv[2];

if (!commitFilePath) {
  console.error('Missing commit message file path.');
  process.exit(1);
}

const message = readFileSync(commitFilePath, 'utf8').trim();
const commitPattern = /^(feat|fix|chore|docs|refactor|test|perf): .+ #[0-9]+$/;
const infraPattern = /^(chore|docs): .+$/;

if (!commitPattern.test(message) && !infraPattern.test(message)) {
  console.error(
    'Invalid commit message. Use "scope: commit name #issue-id" (e.g., feat: add recipe form #12).',
  );
  process.exit(1);
}

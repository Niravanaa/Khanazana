import { execSync } from 'node:child_process';

const branchPattern = /^(feature|fix|chore|docs|refactor|test|hotfix)\/[0-9]+-[a-z0-9-]+$/;

function getBranchName() {
  if (process.env.GITHUB_HEAD_REF) {
    return process.env.GITHUB_HEAD_REF;
  }

  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const branchName = getBranchName();

if (!branchName) process.exit(0);
if (branchName === 'main' || branchName === 'develop') process.exit(0);

if (!branchPattern.test(branchName)) {
  console.error(
    'Invalid branch name. Use scope/<issue-id>-branch-name (e.g., feature/1-recipe-crud).',
  );
  process.exit(1);
}

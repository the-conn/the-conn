import type { Run } from '@/types/api';

const RAW_BASE = process.env.NEXT_PUBLIC_GIT_BASE_URL ?? 'https://github.com';
const GIT_BASE = RAW_BASE.replace(/\/+$/, '');

export function getGitTriggerUrl(run: Run): string {
  const owner = encodeURIComponent(run.owner);
  const repo = encodeURIComponent(run.repo);
  const repoBase = `${GIT_BASE}/${owner}/${repo}`;

  if (run.pr_number !== null && run.pr_number !== undefined) {
    return `${repoBase}/pull/${run.pr_number}`;
  }
  if (run.tag) {
    return `${repoBase}/releases/tag/${encodeURIComponent(run.tag)}`;
  }
  return `${repoBase}/commit/${run.sha}`;
}

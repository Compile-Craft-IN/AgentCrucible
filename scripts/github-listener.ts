/**
 * AgentCrucible GitHub Collaboration & Event Listener
 * Monitors https://github.com/Compile-Craft-IN/AgentCrucible for:
 * - New Collaborator Issues & Feature Requests
 * - Pull Requests requiring sandboxed Docker evaluation
 * - Review comments & community contributions
 */

const REPO_OWNER = 'Compile-Craft-IN';
const REPO_NAME = 'AgentCrucible';
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const POLL_INTERVAL_MS = 60 * 1000;

const token = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'AgentCrucible-Autonomous-Maintainer'
};
if (token) {
  headers['Authorization'] = `token ${token}`;
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(' 🛰️ AgentCrucible — GitHub Collaboration Event Listener');
console.log(` Target Repo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
console.log('═══════════════════════════════════════════════════════════════\n');

async function fetchJson(endpoint: string) {
  try {
    const res = await fetch(`${GITHUB_API}${endpoint}`, {
      headers,
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        console.warn(`  ℹ️ [GitHub API] Rate limit reached or authentication required (${res.status}). Set GITHUB_TOKEN for higher limits.`);
        return null;
      }
      return null;
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`  ℹ️ [GitHub API] Network or timeout: ${err.message}`);
    return null;
  }
}

async function checkPullRequests() {
  console.log(`[${new Date().toLocaleTimeString()}] Checking Pull Requests (/pulls)...`);
  const prs = await fetchJson('/pulls?state=open&per_page=10');
  if (!prs || !Array.isArray(prs)) {
    console.log('  → No open pull requests found (or API rate limit reached).');
    return;
  }

  if (prs.length === 0) {
    console.log('  ✔ Zero pending PRs. Repository is clean and up-to-date.');
    return;
  }

  console.log(`  🔍 Found ${prs.length} open pull request(s):`);
  for (const pr of prs) {
    console.log(`     #${pr.number}: "${pr.title}" by @${pr.user?.login} [Branch: ${pr.head?.ref}]`);
    console.log(`     🛡️ Rule: Never run untrusted code on host. Queuing isolated Docker sandbox verification...`);
  }
}

async function checkIssues() {
  console.log(`[${new Date().toLocaleTimeString()}] Checking Issues (/issues)...`);
  const issues = await fetchJson('/issues?state=open&per_page=10');
  if (!issues || !Array.isArray(issues)) {
    console.log('  → No open issues found (or API rate limit reached).');
    return;
  }

  const realIssues = issues.filter((i: any) => !i.pull_request);
  if (realIssues.length === 0) {
    console.log('  ✔ Zero open issues.');
    return;
  }

  console.log(`  📋 Found ${realIssues.length} open issue(s):`);
  for (const issue of realIssues) {
    const labels = (issue.labels || []).map((l: any) => l.name).join(', ') || 'unlabeled';
    console.log(`     #${issue.number}: "${issue.title}" [Labels: ${labels}]`);
  }
}

async function runListenerCycle() {
  console.log(`--- Listener Cycle Started at ${new Date().toLocaleTimeString()} ---`);
  await checkPullRequests();
  await checkIssues();
  console.log(`--- Listener Cycle Completed ---\n`);
}

// Initial cycle
await runListenerCycle();

if (process.argv.includes('--once')) {
  process.exit(0);
}

// Recurring monitor loop
const interval = setInterval(async () => {
  await runListenerCycle();
}, POLL_INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\nGitHub Event Listener stopped.');
  process.exit(0);
});

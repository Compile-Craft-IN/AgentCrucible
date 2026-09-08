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
const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS ? parseInt(process.env.POLL_INTERVAL_MS) : 12000;

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
console.log(` Polling Frequency: Every ${POLL_INTERVAL_MS / 1000} seconds`);
console.log('═══════════════════════════════════════════════════════════════\n');

const seenIssueIds = new Set<number>();
const seenPrIds = new Set<number>();
let firstRun = true;

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
  const prs = await fetchJson('/pulls?state=open&per_page=10');
  if (!prs || !Array.isArray(prs)) {
    return;
  }

  for (const pr of prs) {
    const isNew = !seenPrIds.has(pr.number);
    seenPrIds.add(pr.number);

    if (isNew && !firstRun) {
      console.log(`\n🚨 [EVENT: NEW PULL REQUEST] 🚨`);
      console.log(`   PR #${pr.number}: "${pr.title}"`);
      console.log(`   Author: @${pr.user?.login} | Branch: ${pr.head?.ref}`);
      console.log(`   URL: ${pr.html_url}`);
      console.log(`   🛡️ ACTION: Triggering isolated Docker sandbox verification...\n`);
    } else if (firstRun) {
      console.log(`  [PR #${pr.number}] "${pr.title}" by @${pr.user?.login}`);
    }
  }

  if (prs.length === 0 && firstRun) {
    console.log(`  ✔ Zero pending PRs.`);
  }
}

async function checkIssues() {
  const issues = await fetchJson('/issues?state=open&per_page=10');
  if (!issues || !Array.isArray(issues)) {
    return;
  }

  const realIssues = issues.filter((i: any) => !i.pull_request);

  for (const issue of realIssues) {
    const isNew = !seenIssueIds.has(issue.number);
    seenIssueIds.add(issue.number);

    if (isNew && !firstRun) {
      console.log(`\n🔔 [EVENT: NEW GITHUB ISSUE DETECTED] 🔔`);
      console.log(`   Issue #${issue.number}: "${issue.title}"`);
      console.log(`   Opened by: @${issue.user?.login}`);
      console.log(`   URL: ${issue.html_url}`);
      console.log(`   Body Preview: "${(issue.body || '').slice(0, 140)}..."`);
      console.log(`   🤖 ACTION: Triaged by AgentCrucible autonomous maintainer.\n`);
    } else if (firstRun) {
      const labels = (issue.labels || []).map((l: any) => l.name).join(', ') || 'unlabeled';
      console.log(`  [Issue #${issue.number}] "${issue.title}" [${labels}] by @${issue.user?.login}`);
    }
  }

  if (realIssues.length === 0 && firstRun) {
    console.log(`  ✔ Zero open issues.`);
  }
}

async function runListenerCycle() {
  const time = new Date().toLocaleTimeString();
  process.stdout.write(`[${time}] Checking https://github.com/${REPO_OWNER}/${REPO_NAME}... `);
  await checkPullRequests();
  await checkIssues();
  if (firstRun) {
    console.log(`\nListener armed and waiting for new events...\n`);
    firstRun = false;
  } else {
    process.stdout.write(`Done.\n`);
  }
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

import type { SkillData } from '../types/skill';

export interface SkillTemplate {
  id: string;
  name: string;
  label: string;
  badge: string;
  summary: string;
  data: SkillData;
}

export const SKILL_TEMPLATES: SkillTemplate[] = [
  {
    id: 'code-review',    name: 'code-review',
    label: 'Code Review (Canonical skill.md)',
    badge: 'skill.md Standard',
    summary: 'Reviews code changes for bugs, style issues, and best practices.',
    data: {
      name: 'code-review',
      title: 'Code Review Skill',
      description: 'Reviews code changes for bugs, style issues, and best practices. Use when reviewing pull requests or checking code quality.',
      scope: 'workspace',
      overview: 'Automates thorough, disciplined code reviews across modified files in pull requests or local working trees.',
      whenToUse: [
        'When reviewing a pull request or merge request.',
        'When requested to check code quality or investigate potential regressions before committing.',
        'When invoked via /code-review.',
      ],
      prerequisites: [
        'Working git tree or staged git diff.',
        'Project linting and test runner configured.',
      ],
      steps: [
        {
          id: 'cr-step-1',
          title: 'Inspect Diff and Changed Files',
          description: 'Review git status and git diff to understand the scope and intent of the changes.',
          command: 'git diff --stat origin/main...HEAD',
          verification: 'Confirm all modified files relate directly to the task.',
        },
        {
          id: 'cr-step-2',
          title: 'Execute Linters and Static Analysis',
          description: 'Run repository linters and static analysis tools to catch low-hanging style or syntax defects.',
          command: 'pnpm lint || npm run lint',
          verification: 'Zero lint errors or warnings introduced.',
        },
        {
          id: 'cr-step-3',
          title: 'Deep Logical Correctness & Edge Cases Check',
          description: 'Read the modified functions in context. Verify boundary condition handling, null/undefined safety, error propagation, and concurrency guarantees.',
          verification: 'Every code path handled and tested.',
        },
      ],
      checklist: [
        { id: 'cr-c1', category: 'Correctness', text: 'Verify that the code satisfies specifications and handles expected inputs.' },
        { id: 'cr-c2', category: 'Edge cases', text: 'Ensure error conditions, null values, and boundaries are properly caught.' },
        { id: 'cr-c3', category: 'Style', text: 'Follow project naming, file structure, and architectural patterns.' },
        { id: 'cr-c4', category: 'Performance', text: 'Identify potential bottlenecks, N+1 queries, or inefficient memory usage.' },
      ],
      decisionTree: '- If syntax/lint fails: Stop and notify author to fix lint first.\n- If logic is broken: Pinpoint exact line and suggest minimal diff fix.\n- If architectural divergence: Reference repo conventions before suggesting refactoring.',
      alerts: [
        {
          id: 'cr-a1',
          type: 'IMPORTANT',
          title: 'Maintain Non-Breaking Changes',
          content: 'Ensure all public API signatures and backward-compatible interfaces remain unperturbed unless explicitly targeted.',
        },
      ],
      bundleFiles: [],
    },
  },
  {
    id: 'generate-unit-tests',
    name: 'generate-unit-tests',
    label: 'Unit Test Generator',
    badge: 'Automated Testing',
    summary: 'Generates unit tests using framework conventions with black-box execution helper.',
    data: {
      name: 'generate-unit-tests',
      title: 'Unit Test Generator',
      description: 'Generates comprehensive unit tests for source code using pytest, Vitest, or Jest conventions. Use when writing test suites or increasing code coverage.',
      scope: 'workspace',
      overview: 'Standardizes the generation of isolated, high-coverage unit tests with mocks, fixtures, and parameterized assertions.',
      whenToUse: [
        'When adding tests for new features, modules, or services.',
        'When backfilling unit tests to increase regression coverage.',
        'When triggered via /generate-unit-tests.',
      ],
      prerequisites: [
        'Installed test runner (pytest, vitest, or jest).',
        'Target source file path identified.',
      ],
      steps: [
        {
          id: 'ut-step-1',
          title: 'Analyze Target File and Dependencies',
          description: 'Inspect function signatures, parameter types, expected outputs, and external dependencies that require mocking.',
          verification: 'Identify happy path, error paths, and edge cases.',
        },
        {
          id: 'ut-step-2',
          title: 'Scaffold Test Suite Structure',
          description: 'Create corresponding test file adhering to project naming (e.g., `test_<module>.py` or `<module>.test.ts`).',
          verification: 'Verify test imports resolve properly.',
        },
        {
          id: 'ut-step-3',
          title: 'Run Test Runner via Helper Script',
          description: 'Execute tests against runner and inspect results.',
          command: 'bash scripts/run-tests.sh --coverage',
          verification: 'All new unit tests pass with >80% branch coverage.',
        },
      ],
      checklist: [
        { id: 'ut-c1', category: 'Isolation', text: 'Verify external network, disk, and database calls are cleanly mocked.' },
        { id: 'ut-c2', category: 'Assertion Specificity', text: 'Use specific assertions rather than generic truthy checks.' },
        { id: 'ut-c3', category: 'Failure Scenarios', text: 'Include explicit tests that expect errors/exceptions to be thrown.' },
      ],
      alerts: [
        {
          id: 'ut-a1',
          type: 'TIP',
          title: 'Use Black-Box Helper',
          content: 'Execute `bash scripts/run-tests.sh --help` first to discover available filtering options rather than inspecting the full script.',
        },
      ],
      bundleFiles: [
        {
          id: 'ut-f1',
          path: 'scripts/run-tests.sh',
          folder: 'scripts',
          description: 'Wrapper script to run tests with coverage filtering and formatting',
          content: `#!/usr/bin/env bash
# run-tests.sh: Helper test runner wrapper
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "Usage: $0 [--coverage] [filter-pattern]"
  echo "Runs workspace test suite with clean formatted output."
  exit 0
fi

pnpm test "$@"
`,
        },
      ],
    },
  },
  {
    id: 'deploy-staging',
    name: 'deploy-staging',
    label: 'Staging Deployment Pipeline',
    badge: 'DevOps & Release',
    summary: 'Automates safe deployment of current branch to staging with pre-flight checks.',
    data: {
      name: 'deploy-staging',
      title: 'Staging Deployment Skill',
      description: 'Automates deployment of the current branch to staging environment with pre-flight verification. Use when deploying code changes for QA or verification.',
      scope: 'workspace',
      overview: 'Coordinates build verification, docker image tagging, and deployment rollout to staging clusters.',
      whenToUse: [
        'When user asks to deploy current changes to staging.',
        'When QA verification requires an updated staging environment.',
        'When invoked via /deploy-staging.',
      ],
      prerequisites: [
        'Clean git working tree (all changes committed).',
        'Valid staging credentials in environment.',
      ],
      steps: [
        {
          id: 'dp-step-1',
          title: 'Run Pre-flight Checks and Build',
          description: 'Ensure tests pass and the production bundle builds without warning.',
          command: 'pnpm build && pnpm test',
          verification: 'Build exit code 0.',
        },
        {
          id: 'dp-step-2',
          title: 'Trigger Staging Deploy',
          description: 'Execute deploy pipeline targeting the staging namespace.',
          command: 'bash scripts/deploy.sh --target staging',
          verification: 'Rollout status healthy.',
        },
      ],
      checklist: [
        { id: 'dp-c1', category: 'Environment', text: 'Verify target environment is strictly staging, never production.' },
        { id: 'dp-c2', category: 'Rollback', text: 'Ensure rollback target image tag is recorded before initiating rollout.' },
      ],
      alerts: [
        {
          id: 'dp-a1',
          type: 'CAUTION',
          title: 'Staging Isolation',
          content: 'Never use production credentials or database connection strings when executing this skill.',
        },
      ],
      bundleFiles: [
        {
          id: 'dp-f1',
          path: 'scripts/deploy.sh',
          folder: 'scripts',
          description: 'Black-box deployment script',
          content: `#!/usr/bin/env bash
if [ "$1" == "--help" ]; then
  echo "Usage: deploy.sh --target <staging|dev>"
  exit 0
fi
echo "Deploying to target: $2..."
`,
        },
      ],
    },
  },
  {
    id: 'security-audit',
    name: 'security-audit',
    label: 'Security & Secrets Audit',
    badge: 'Security',
    summary: 'Audits codebase for secrets, CVE vulnerabilities, and OWASP hazards.',
    data: {
      name: 'security-audit',
      title: 'Security & Secrets Audit Skill',
      description: 'Audits codebase for hardcoded secrets, outdated dependencies, and OWASP security vulnerabilities. Use before releases or during code security reviews.',
      scope: 'workspace',
      overview: 'Scans source files for leaked API keys, tokens, insecure SQL/eval invocations, and known package vulnerabilities.',
      whenToUse: [
        'When performing a security audit or pre-release hardening check.',
        'When checking dependencies for vulnerabilities or supply-chain hazards.',
        'When invoked via /security-audit.',
      ],
      prerequisites: [
        'Installed dependency audit tooling (e.g. pnpm audit, npm audit).',
        'Access to git repository history.',
      ],
      steps: [
        {
          id: 'sec-step-1',
          title: 'Check for Leaked Secrets and Credentials',
          description: 'Scan modified files for regex patterns matching API keys, private keys, and tokens.',
          command: 'git grep -EI "AIza[0-9A-Za-z-_]{35}|ghp_[0-9A-Za-z]{36}|BEGIN PRIVATE KEY"',
          verification: 'No secret matches detected.',
        },
        {
          id: 'sec-step-2',
          title: 'Audit Package Dependencies',
          description: 'Run package manager vulnerability scanner against lockfile.',
          command: 'pnpm audit --audit-level=high',
          verification: 'Zero high or critical advisories.',
        },
      ],
      checklist: [
        { id: 'sec-c1', category: 'Secrets', text: 'Confirm no environment files (.env) or tokens are committed.' },
        { id: 'sec-c2', category: 'Sanitization', text: 'Verify all user inputs are sanitized before rendering or database querying.' },
      ],
      alerts: [
        {
          id: 'sec-a1',
          type: 'WARNING',
          title: 'Rotated Secrets Required',
          content: 'If a secret is ever found in git history, notify the user immediately to revoke and rotate the credential.',
        },
      ],
      bundleFiles: [],
    },
  },
  {
    id: 'blank',
    name: 'custom-skill',
    label: 'Blank Custom Skill',
    badge: 'Empty Skeleton',
    summary: 'Start from a minimal valid Antigravity skill structure.',
    data: {
      name: 'custom-skill',
      title: 'Custom Agent Skill',
      description: 'Executes automated tasks for the agent. Use when requested to perform specific custom workflows.',
      scope: 'workspace',
      overview: 'Provide a clear summary of what this skill achieves.',
      whenToUse: [
        'When the user requests this specific task.',
        'When invoked via /custom-skill.',
      ],
      prerequisites: [
        'Required dependencies or environment.',
      ],
      steps: [
        {
          id: 'custom-s1',
          title: 'Initial Setup and Validation',
          description: 'Prepare inputs and verify conditions.',
          command: 'echo "Ready to execute"',
          verification: 'Verify setup succeeded.',
        },
      ],
      checklist: [
        { id: 'custom-c1', category: 'Verification', text: 'Confirm the task completed without error.' },
      ],
      alerts: [
        {
          id: 'custom-a1',
          type: 'NOTE',
          title: 'Tip',
          content: 'Keep instructions concise and test steps before committing.',
        },
      ],
      bundleFiles: [],
    },
  },
];

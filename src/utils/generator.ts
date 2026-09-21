import type { SkillData, SkillScope } from '../types/skill';

export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSkillMarkdown(data: SkillData): string {
  const safeName = toKebabCase(data.name || data.title || 'untitled-skill');
  const safeDesc = (data.description || 'Executes tasks for the agent.').replace(/"/g, '\\"');

  const lines: string[] = [];

  // 1. YAML Frontmatter
  lines.push('---');
  lines.push(`name: ${safeName}`);
  lines.push(`description: ${safeDesc}`);
  lines.push('---');
  lines.push('');

  // 2. Title & Overview
  const title = data.title.trim() || `${safeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Skill`;
  lines.push(`# ${title}`);
  lines.push('');

  if (data.overview.trim()) {
    lines.push(data.overview.trim());
    lines.push('');
  }

  // 3. When to Use
  if (data.whenToUse && data.whenToUse.length > 0) {
    const validWhen = data.whenToUse.filter((w) => w.trim().length > 0);
    if (validWhen.length > 0) {
      lines.push('## When to Use');
      lines.push('');
      for (const item of validWhen) {
        lines.push(`- ${item.trim()}`);
      }
      lines.push('');
    }
  }

  // 4. Prerequisites
  if (data.prerequisites && data.prerequisites.length > 0) {
    const validPrereqs = data.prerequisites.filter((p) => p.trim().length > 0);
    if (validPrereqs.length > 0) {
      lines.push('## Prerequisites & Environment');
      lines.push('');
      for (const item of validPrereqs) {
        lines.push(`- ${item.trim()}`);
      }
      lines.push('');
    }
  }

  // 5. Alerts / Callouts (Important notes up-front)
  const importantAlerts = (data.alerts || []).filter((a) => a.content.trim().length > 0);
  if (importantAlerts.length > 0) {
    for (const alert of importantAlerts) {
      lines.push(`> [!${alert.type}]`);
      if (alert.title && alert.title.trim()) {
        lines.push(`> **${alert.title.trim()}**`);
      }
      const alertLines = alert.content.trim().split('\n');
      for (const al of alertLines) {
        lines.push(`> ${al}`);
      }
      lines.push('');
    }
  }

  // 6. Step-by-Step Instructions
  const validSteps = (data.steps || []).filter((s) => s.title.trim().length > 0);
  if (validSteps.length > 0) {
    lines.push('## Instructions & Workflow');
    lines.push('');
    validSteps.forEach((step, index) => {
      lines.push(`### Step ${index + 1}: ${step.title.trim()}`);
      lines.push('');
      if (step.description.trim()) {
        lines.push(step.description.trim());
        lines.push('');
      }
      if (step.command && step.command.trim()) {
        lines.push('```bash');
        lines.push(step.command.trim());
        lines.push('```');
        lines.push('');
      }
      if (step.verification && step.verification.trim()) {
        lines.push(`**Verification**: ${step.verification.trim()}`);
        lines.push('');
      }
    });
  }

  // 7. Review Checklist
  const validChecklist = (data.checklist || []).filter((c) => c.text.trim().length > 0);
  if (validChecklist.length > 0) {
    lines.push('## Review Checklist');
    lines.push('');
    validChecklist.forEach((item, index) => {
      if (item.category && item.category.trim()) {
        lines.push(`${index + 1}. **${item.category.trim()}**: ${item.text.trim()}`);
      } else {
        lines.push(`- [ ] ${item.text.trim()}`);
      }
    });
    lines.push('');
  }

  // 8. Decision Tree / Guidelines
  if (data.decisionTree && data.decisionTree.trim()) {
    lines.push('## Decision Tree & Troubleshooting');
    lines.push('');
    lines.push(data.decisionTree.trim());
    lines.push('');
  }

  // 9. Scripts & Black-box instructions if bundle files exist
  const scripts = (data.bundleFiles || []).filter((f) => f.folder === 'scripts');
  if (scripts.length > 0) {
    lines.push('## Scripts & Black-Box Execution');
    lines.push('');
    lines.push('> [!TIP]');
    lines.push('> Always run helper scripts with `--help` first to discover valid arguments without loading full source code into context.');
    lines.push('');
    for (const s of scripts) {
      lines.push(`- \`${s.path}\`${s.description ? `: ${s.description}` : ''}`);
    }
    lines.push('');
  }

  // 10. Progressive Disclosure References
  const references = (data.bundleFiles || []).filter((f) => f.folder === 'references');
  if (references.length > 0) {
    lines.push('## Detailed References');
    lines.push('');
    for (const r of references) {
      lines.push(`- [${r.description || r.path}](${r.path})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function parseSkillMarkdown(markdown: string): Partial<SkillData> {
  const result: Partial<SkillData> = {
    whenToUse: [],
    prerequisites: [],
    steps: [],
    checklist: [],
    alerts: [],
    bundleFiles: [],
  };

  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  let body = markdown;

  if (frontmatterMatch) {
    const fmText = frontmatterMatch[1];
    body = markdown.slice(frontmatterMatch[0].length).trim();

    const nameMatch = fmText.match(/^name:\s*(.+)$/m);
    if (nameMatch) result.name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');

    const descMatch = fmText.match(/^description:\s*([\s\S]+?)(?=\n[a-z_]+:|$)/m);
    if (descMatch) result.description = descMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  // Extract title
  const titleMatch = body.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  return result;
}

export function getScopePath(scope: SkillScope, skillName: string, pluginName?: string): string {
  const name = toKebabCase(skillName || 'my-skill');
  switch (scope) {
    case 'workspace':
      return `.agents/skills/${name}/`;
    case 'global':
      return `~/.gemini/config/skills/${name}/`;
    case 'plugin':
      return `~/.gemini/antigravity-cli/plugins/${pluginName || 'my-plugin'}/skills/${name}/`;
  }
}

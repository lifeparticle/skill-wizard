#!/usr/bin/env node

/**
 * Antigravity Agent Skill Generator CLI
 * Generates skills based on skill.md specifications using @google/genai & gemini-flash-latest
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { GoogleGenAI } from '@google/genai';

// Simple .env reader if .env exists
function loadEnv() {
  const envPaths = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '.env.local')];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
}

loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function toKebabCase(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SYSTEM_INSTRUCTION = `You are an expert Antigravity Agent Skill Architect.
Your task is to generate complete, production-ready agent skills adhering strictly to the AgentSkills open standard and Google Antigravity specifications (based on skill.md).

Skill Guidelines:
1. Anatomy of a skill:
   - SKILL.md with YAML frontmatter.
   - Optional auxiliary files: scripts/ (executable helper scripts), references/ (in-depth documentation for progressive disclosure), resources/ (templates, schemas, configs).
2. Manifest format:
   - Frontmatter name: lowercase, hyphens for spaces (kebab-case), alphanumeric.
   - Frontmatter description: REQUIRED. Must be written in 3rd person (e.g., "Reviews code changes...", "Generates unit tests...", "Automates deployment..."). Must include explicit trigger conditions explaining when the agent should autonomously activate the skill (e.g. "Use when reviewing pull requests...").
3. Progressive Disclosure:
   - Keep main SKILL.md focused and under 200 lines.
   - Place large schemas or long cheat sheets in references/.
   - For scripts, instruct the agent to run them with \`--help\` first as black boxes.
4. Content Structure:
   - Human-readable Title
   - Overview & Purpose
   - When to Use (bulleted trigger list)
   - Prerequisites & Environment (tools, env variables)
   - Step-by-Step Instructions (actionable steps, commands, verification)
   - Review Checklist (categories e.g. Correctness, Edge Cases, Security, Performance)
   - Alerts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])

Return ONLY a valid JSON object matching this schema:
{
  "name": "kebab-case-name",
  "title": "Human Friendly Skill Title",
  "description": "Reviews code changes for bugs, style issues, and best practices. Use when reviewing pull requests or checking code quality.",
  "overview": "Detailed overview of the skill purpose and scope.",
  "whenToUse": ["Trigger condition 1", "Trigger condition 2"],
  "prerequisites": ["Prerequisite 1", "Required CLI tool"],
  "steps": [
    {
      "title": "Step title",
      "description": "Step details and instructions",
      "command": "optional bash command",
      "verification": "verification instruction"
    }
  ],
  "checklist": [
    {
      "category": "Correctness",
      "text": "verify that all edge cases are handled"
    }
  ],
  "decisionTree": "Optional decision tree or guidelines",
  "alerts": [
    {
      "type": "IMPORTANT",
      "title": "Crucial Step",
      "content": "Description of the alert"
    }
  ],
  "bundleFiles": [
    {
      "path": "scripts/verify.sh",
      "folder": "scripts",
      "content": "#!/usr/bin/env bash\\n# Script with --help\\nif [ \\"$1\\" == \\"--help\\" ]; then echo \\"Usage: $0\\"; exit 0; fi\\n",
      "description": "Helper script"
    }
  ]
}`;

function buildSkillMarkdown(data) {
  const safeName = toKebabCase(data.name || data.title || 'untitled-skill');
  const safeDesc = (data.description || 'Executes tasks for the agent.').replace(/"/g, '\\"');

  const lines = [];

  // Frontmatter
  lines.push('---');
  lines.push(`name: ${safeName}`);
  lines.push(`description: ${safeDesc}`);
  lines.push('---');
  lines.push('');

  // Title & Overview
  const title = data.title || `${safeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Skill`;
  lines.push(`# ${title}`);
  lines.push('');

  if (data.overview && data.overview.trim()) {
    lines.push(data.overview.trim());
    lines.push('');
  }

  // When to Use
  if (Array.isArray(data.whenToUse) && data.whenToUse.length > 0) {
    lines.push('## When to Use');
    lines.push('');
    for (const item of data.whenToUse) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  // Prerequisites
  if (Array.isArray(data.prerequisites) && data.prerequisites.length > 0) {
    lines.push('## Prerequisites & Environment');
    lines.push('');
    for (const item of data.prerequisites) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  // Alerts
  if (Array.isArray(data.alerts) && data.alerts.length > 0) {
    for (const alert of data.alerts) {
      lines.push(`> [!${alert.type || 'NOTE'}]`);
      if (alert.title) lines.push(`> **${alert.title}**`);
      for (const l of (alert.content || '').split('\n')) {
        lines.push(`> ${l}`);
      }
      lines.push('');
    }
  }

  // Steps
  if (Array.isArray(data.steps) && data.steps.length > 0) {
    lines.push('## Instructions & Workflow');
    lines.push('');
    data.steps.forEach((step, idx) => {
      lines.push(`### Step ${idx + 1}: ${step.title}`);
      lines.push('');
      if (step.description) {
        lines.push(step.description);
        lines.push('');
      }
      if (step.command) {
        lines.push('```bash');
        lines.push(step.command.trim());
        lines.push('```');
        lines.push('');
      }
      if (step.verification) {
        lines.push(`**Verification**: ${step.verification}`);
        lines.push('');
      }
    });
  }

  // Checklist
  if (Array.isArray(data.checklist) && data.checklist.length > 0) {
    lines.push('## Review Checklist');
    lines.push('');
    data.checklist.forEach((item, idx) => {
      if (item.category) {
        lines.push(`${idx + 1}. **${item.category}**: ${item.text}`);
      } else {
        lines.push(`- [ ] ${item.text}`);
      }
    });
    lines.push('');
  }

  // Decision Tree
  if (data.decisionTree && data.decisionTree.trim()) {
    lines.push('## Decision Tree & Troubleshooting');
    lines.push('');
    lines.push(data.decisionTree.trim());
    lines.push('');
  }

  // Scripts black box
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

  return lines.join('\n');
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let prompt = '';
  let scope = 'workspace';
  let outDir = '';
  let model = 'gemini-flash-latest';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════');
      console.log('\x1b[1m%s\x1b[0m', '  Antigravity Agent Skill Generator (CLI)');
      console.log('\x1b[36m%s\x1b[0m', '  Compliant with skill.md & AgentSkills Open Standard');
      console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════\n');
      console.log('Usage:');
      console.log('  pnpm run generate [prompt] [options]');
      console.log('  node cli.mjs [prompt] [options]\n');
      console.log('Options:');
      console.log('  --scope <workspace|global>   Target installation location (default: workspace)');
      console.log('  --out <dir>                  Custom directory path to save skill');
      console.log('  --model <model>              Gemini model to use (default: gemini-flash-latest)');
      console.log('  --help, -h                   Show this help message\n');
      console.log('Environment Variables:');
      console.log('  GEMINI_API_KEY               Google GenAI API Key (or in .env)\n');
      console.log('Examples:');
      console.log('  pnpm run generate "E2E Playwright test generator"');
      console.log('  pnpm run generate "Docker security auditor" --scope global');
      console.log('  pnpm run generate "PostgreSQL migration checker" --out ./my-skills/pg-check\n');
      process.exit(0);
    } else if (args[i] === '--scope' && args[i + 1]) {
      scope = args[++i];
    } else if (args[i] === '--out' && args[i + 1]) {
      outDir = args[++i];
    } else if (args[i] === '--model' && args[i + 1]) {
      model = args[++i];
    } else if (!args[i].startsWith('--')) {
      prompt = args[i];
    }
  }

  console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════');
  console.log('\x1b[1m%s\x1b[0m', '  Antigravity Agent Skill Generator (CLI)');
  console.log('\x1b[36m%s\x1b[0m', '  Compliant with skill.md & AgentSkills Open Standard');
  console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════\n');

  if (!prompt) {
    prompt = await promptUser('Describe the skill you want to generate:\n> ');
  }

  if (!prompt) {
    console.error('\x1b[31mError: No prompt provided.\x1b[0m');
    process.exit(1);
  }

  let apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    apiKey = await promptUser('GEMINI_API_KEY environment variable not found. Enter API Key:\n> ');
  }

  if (!apiKey) {
    console.error('\x1b[31mError: A valid Gemini API Key is required.\x1b[0m');
    console.log('Get one free at https://aistudio.google.com/apikey');
    process.exit(1);
  }

  console.log(`\n⏳ Generating skill with Gemini model "\x1b[36m${model}\x1b[0m"...`);

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Create a complete, production-grade Antigravity Agent Skill based on the following request:\n\n"${prompt}"\n\nReturn ONLY the JSON matching the schema.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    let cleanJson = (responseText || '').trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(cleanJson);
    const skillName = toKebabCase(data.name || 'custom-skill');
    const markdown = buildSkillMarkdown(data);

    // Resolve target directory
    let targetDir = outDir;
    if (!targetDir) {
      if (scope === 'global') {
        targetDir = path.join(os.homedir(), '.gemini', 'config', 'skills', skillName);
      } else {
        targetDir = path.join(process.cwd(), '.agents', 'skills', skillName);
      }
    }

    fs.mkdirSync(targetDir, { recursive: true });

    // Write SKILL.md
    const skillMdPath = path.join(targetDir, 'SKILL.md');
    fs.writeFileSync(skillMdPath, markdown, 'utf-8');

    // Write auxiliary files
    const auxiliaryFiles = [];
    if (Array.isArray(data.bundleFiles)) {
      for (const file of data.bundleFiles) {
        if (file.path && file.content) {
          const filePath = path.join(targetDir, file.path);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, file.content, 'utf-8');
          if (file.folder === 'scripts') {
            try {
              fs.chmodSync(filePath, 0o755);
            } catch {}
          }
          auxiliaryFiles.push(file.path);
        }
      }
    }

    console.log('\n\x1b[32m✔ Skill generated successfully!\x1b[0m');
    console.log(`  Name: \x1b[1m${skillName}\x1b[0m`);
    console.log(`  Slash Command: \x1b[35m/${skillName}\x1b[0m`);
    console.log(`  Target Path: \x1b[34m${skillMdPath}\x1b[0m`);
    if (auxiliaryFiles.length > 0) {
      console.log('  Auxiliary Bundle Files:');
      for (const f of auxiliaryFiles) {
        console.log(`   - ${f}`);
      }
    }
    console.log('\n\x1b[36mDiscovery:\x1b[0m The agent will automatically read this skill when relevant tasks arise.');
    console.log(`\x1b[36mManual Trigger:\x1b[0m Type /${skillName} in your agent chat.\n`);
  } catch (err) {
    console.error('\x1b[31mFailed to generate skill:\x1b[0m', err.message);
    process.exit(1);
  }
}

main();

import { GoogleGenAI } from '@google/genai';
import type { SkillData, AlertType, BundleFolder } from '../types/skill';
import { toKebabCase } from './generator';

interface GeminiStepJson {
  title?: string;
  description?: string;
  command?: string;
  verification?: string;
}

interface GeminiChecklistJson {
  category?: string;
  text?: string;
}

interface GeminiAlertJson {
  type?: AlertType;
  title?: string;
  content?: string;
}

interface GeminiBundleFileJson {
  path?: string;
  folder?: BundleFolder;
  content?: string;
  description?: string;
}

const SYSTEM_INSTRUCTION = `You are an expert Antigravity Agent Skill Architect.
Your role is to design high-quality, production-ready agent skills adhering strictly to the AgentSkills open standard and Google Antigravity specifications.

Skill Guidelines based on skill.md:
1. Anatomy:
   - SKILL.md with YAML frontmatter.
   - Optional auxiliary files: scripts/ (executable helper scripts), references/ (in-depth documentation for progressive disclosure), resources/ (templates, schemas, configs), examples/ (sample code/inputs).
2. Manifest format:
   - Frontmatter name: lowercase, hyphens for spaces (kebab-case), alphanumeric.
   - Frontmatter description: REQUIRED. Must be written in 3rd person (e.g., "Reviews code changes...", "Generates unit tests...", "Automates deployment..."). Must include explicit trigger conditions explaining when the agent should autonomously activate the skill (e.g. "Use when reviewing pull requests...").
3. Progressive Disclosure:
   - Keep main SKILL.md focused and under 200 lines.
   - Place large schemas, heavy reference docs, or cheatsheets in references/ or resources/.
   - For scripts, instruct the agent to run them with \`--help\` first as black boxes.
4. Content Structure:
   - Human-readable Title
   - Overview & Purpose
   - When to Use (bulleted trigger list)
   - Prerequisites & Environment (tools, env variables)
   - Step-by-Step Instructions (actionable steps, commands, verification)
   - Review Checklist (categories e.g. Correctness, Edge Cases, Security, Performance)
   - Alerts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])

You must respond ONLY with a valid JSON object matching this schema (do NOT wrap with extra explanation outside the JSON):
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
      "content": "#!/usr/bin/env bash\\n# Script content with --help support",
      "description": "Helper script"
    }
  ]
}`;

export interface GenerateSkillOptions {
  apiKey: string;
  userPrompt: string;
  model?: string;
  targetScope?: 'workspace' | 'global' | 'plugin';
}

export async function generateSkillWithGemini(options: GenerateSkillOptions): Promise<SkillData> {
  const { apiKey, userPrompt, model = 'gemini-flash-latest', targetScope = 'workspace' } = options;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API Key is required. Please provide an API key in settings or input field.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const promptText = `Create a complete, production-grade Antigravity Agent Skill based on the following user request:

"${userPrompt}"

Ensure:
- Name is clean kebab-case.
- Description starts in 3rd person with an action verb and includes explicit "Use when..." triggering criteria.
- Detailed, actionable steps with verification.
- Review checklist with categories.
- At least one helpful alert (e.g. IMPORTANT or WARNING).
- If appropriate, generate 1 or 2 relevant auxiliary files in scripts/ (with executable bash/python using --help flag) or references/ (for progressive disclosure).

Return ONLY the raw JSON object.`;

  const response = await ai.models.generateContent({
    model,
    contents: promptText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('No response received from Gemini API.');
  }

  // Parse JSON
  let cleanJson = responseText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanJson);
    const skillName = toKebabCase(parsed.name || 'custom-skill');

    return {
      name: skillName,
      title: parsed.title || `${skillName.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Skill`,
      description: parsed.description || 'Executes tasks for the agent. Use when triggered by relevant prompts.',
      scope: targetScope,
      overview: parsed.overview || '',
      whenToUse: Array.isArray(parsed.whenToUse) ? parsed.whenToUse : [],
      prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
      steps: Array.isArray(parsed.steps)
        ? parsed.steps.map((s: GeminiStepJson, idx: number) => ({
            id: `step-${Date.now()}-${idx}`,
            title: s.title || `Step ${idx + 1}`,
            description: s.description || '',
            command: s.command || '',
            verification: s.verification || '',
          }))
        : [],
      checklist: Array.isArray(parsed.checklist)
        ? parsed.checklist.map((c: GeminiChecklistJson, idx: number) => ({
            id: `check-${Date.now()}-${idx}`,
            category: c.category || 'Quality',
            text: c.text || '',
          }))
        : [],
      decisionTree: parsed.decisionTree || '',
      alerts: Array.isArray(parsed.alerts)
        ? parsed.alerts.map((a: GeminiAlertJson, idx: number) => ({
            id: `alert-${Date.now()}-${idx}`,
            type: a.type || 'NOTE',
            title: a.title || '',
            content: a.content || '',
          }))
        : [],
      bundleFiles: Array.isArray(parsed.bundleFiles)
        ? parsed.bundleFiles.map((f: GeminiBundleFileJson, idx: number) => ({
            id: `file-${Date.now()}-${idx}`,
            path: f.path || `scripts/helper-${idx + 1}.sh`,
            folder: f.folder || (f.path?.startsWith('references') ? 'references' : 'scripts'),
            content: f.content || '',
            description: f.description || '',
          }))
        : [],
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', cleanJson, err);
    throw new Error('Received malformed JSON from Gemini. Please try again.', { cause: err });
  }
}

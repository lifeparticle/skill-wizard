import type { SkillData, SkillValidationResult } from '../types/skill';
import { generateSkillMarkdown, toKebabCase } from './generator';

const THIRD_PERSON_REGEX = /^(Reviews|Generates|Automates|Validates|Executes|Deploys|Extracts|Scaffolds|Inspects|Audits|Checks|Monitors|Creates|Fixes|Manages|Assists|Transforms|Analyzes|Runs|Applies|Configures|Helps|Discovers|Parses|Builds|Optimizes|Migrates)/i;
const TRIGGER_KEYWORDS_REGEX = /(when|use when|whenever|if|in case of|during|for reviewing|for generating|for creating|triggered)/i;

export function validateSkill(data: SkillData): SkillValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const rawName = (data.name || '').trim();
  const kebabName = toKebabCase(rawName);
  const nameKebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(rawName);

  if (!rawName) {
    errors.push('Skill name is required.');
  } else if (!nameKebabCase) {
    warnings.push(`Skill name "${rawName}" should be kebab-case (e.g. "${kebabName}"). Spaces and uppercase will cause issues.`);
  }

  const rawDesc = (data.description || '').trim();
  const hasDescription = rawDesc.length > 0;
  let thirdPersonDescription = false;
  let hasTriggerKeywords = false;

  if (!hasDescription) {
    errors.push('Description is required for autonomous agent discovery.');
  } else {
    thirdPersonDescription = THIRD_PERSON_REGEX.test(rawDesc);
    if (!thirdPersonDescription) {
      warnings.push('Description should be written in third person (e.g., "Reviews code changes...", "Generates unit tests...").');
    }

    hasTriggerKeywords = TRIGGER_KEYWORDS_REGEX.test(rawDesc);
    if (!hasTriggerKeywords) {
      suggestions.push('Add explicit trigger phrasing like "Use when reviewing pull requests..." so the agent activates reliably.');
    }
  }

  const hasWorkflowSteps = (data.steps || []).filter((s) => s.title.trim().length > 0).length > 0;
  if (!hasWorkflowSteps) {
    warnings.push('Add at least one step in Instructions & Workflow to give the agent an actionable execution plan.');
  }

  const hasChecklist = (data.checklist || []).filter((c) => c.text.trim().length > 0).length > 0;
  if (!hasChecklist) {
    suggestions.push('Add a Review Checklist (e.g. Correctness, Edge cases, Style, Performance) to ensure high-quality output.');
  }

  const generatedMd = generateSkillMarkdown(data);
  const lineCount = generatedMd.split('\n').length;
  const under200Lines = lineCount <= 200;

  if (!under200Lines) {
    warnings.push(`SKILL.md is ${lineCount} lines (recommended < 200 lines). Move bulky schemas or long cheat sheets to "references/" to adhere to progressive disclosure.`);
  }

  // Calculate score
  let score = 100;
  if (!rawName) score -= 30;
  else if (!nameKebabCase) score -= 10;

  if (!hasDescription) score -= 30;
  else {
    if (!thirdPersonDescription) score -= 10;
    if (!hasTriggerKeywords) score -= 10;
  }

  if (!hasWorkflowSteps) score -= 15;
  if (!hasChecklist) score -= 10;
  if (!under200Lines) score -= 10;

  score = Math.max(10, Math.min(100, score));

  return {
    score,
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    checks: {
      nameKebabCase,
      hasDescription,
      thirdPersonDescription,
      hasTriggerKeywords,
      hasWorkflowSteps,
      hasChecklist,
      under200Lines,
      lineCount,
      slashCommand: `/${kebabName || 'my-skill'}`,
    },
  };
}

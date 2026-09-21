export type SkillScope = 'workspace' | 'global' | 'plugin';

export type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

export interface SkillAlert {
  id: string;
  type: AlertType;
  title?: string;
  content: string;
}

export interface SkillStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  verification?: string;
}

export interface SkillChecklistItem {
  id: string;
  text: string;
  category?: string;
}

export type BundleFolder = 'scripts' | 'references' | 'resources' | 'examples';

export interface SkillBundleFile {
  id: string;
  path: string; // e.g. "scripts/check-health.sh" or "references/api-guide.md"
  folder: BundleFolder;
  content: string;
  description?: string;
}

export interface SkillData {
  name: string; // kebab-case unique identifier e.g. "code-review"
  title: string; // Human-readable e.g. "Code Review Skill"
  description: string; // 3rd person description with triggers
  scope: SkillScope;
  pluginName?: string;
  overview: string;
  whenToUse: string[];
  prerequisites: string[];
  steps: SkillStep[];
  checklist: SkillChecklistItem[];
  decisionTree?: string;
  alerts: SkillAlert[];
  bundleFiles: SkillBundleFile[];
}

export interface SkillValidationResult {
  score: number; // 0 to 100
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  checks: {
    nameKebabCase: boolean;
    hasDescription: boolean;
    thirdPersonDescription: boolean;
    hasTriggerKeywords: boolean;
    hasWorkflowSteps: boolean;
    hasChecklist: boolean;
    under200Lines: boolean;
    lineCount: number;
    slashCommand: string;
  };
}

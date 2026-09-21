import React, { useState } from 'react';
import type {
  SkillData,
  SkillStep,
  SkillChecklistItem,
  SkillAlert,
  SkillBundleFile,
  AlertType,
  BundleFolder,
} from '../types/skill';
import { toKebabCase } from '../utils/generator';
import {
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  TerminalIcon,
  ShieldIcon,
  FolderIcon,
  FileIcon,
  AlertTriangleIcon,
} from './Icons';

interface SkillFormProps {
  skill: SkillData;
  onChange: (updated: SkillData) => void;
  onGenerateWithGemini: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  apiKey: string;
  onOpenApiKeyModal: () => void;
}

type ActiveTab = 'metadata' | 'workflow' | 'checklist' | 'bundle';

export const SkillForm: React.FC<SkillFormProps> = ({
  skill,
  onChange,
  onGenerateWithGemini,
  isGenerating,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('metadata');
  const [aiPrompt, setAiPrompt] = useState('');
  const [promptError, setPromptError] = useState('');

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (!apiKey) {
      setPromptError('Please set your Gemini API Key first.');
      onOpenApiKeyModal();
      return;
    }

    setPromptError('');
    try {
      await onGenerateWithGemini(aiPrompt);
    } catch (err: unknown) {
      setPromptError(err instanceof Error ? err.message : 'Failed to generate skill with Gemini');
    }
  };

  // Helper updater
  const update = (fields: Partial<SkillData>) => {
    onChange({ ...skill, ...fields });
  };

  // Handlers for steps
  const addStep = () => {
    const newStep: SkillStep = {
      id: `step-${Date.now()}`,
      title: `Step ${(skill.steps || []).length + 1}`,
      description: '',
      command: '',
      verification: '',
    };
    update({ steps: [...(skill.steps || []), newStep] });
  };

  const updateStep = (index: number, fields: Partial<SkillStep>) => {
    const updated = [...(skill.steps || [])];
    updated[index] = { ...updated[index], ...fields };
    update({ steps: updated });
  };

  const removeStep = (index: number) => {
    const updated = (skill.steps || []).filter((_, idx) => idx !== index);
    update({ steps: updated });
  };

  // Handlers for checklist
  const addChecklistItem = () => {
    const newItem: SkillChecklistItem = {
      id: `check-${Date.now()}`,
      category: 'Correctness',
      text: '',
    };
    update({ checklist: [...(skill.checklist || []), newItem] });
  };

  const updateChecklistItem = (index: number, fields: Partial<SkillChecklistItem>) => {
    const updated = [...(skill.checklist || [])];
    updated[index] = { ...updated[index], ...fields };
    update({ checklist: updated });
  };

  const removeChecklistItem = (index: number) => {
    const updated = (skill.checklist || []).filter((_, idx) => idx !== index);
    update({ checklist: updated });
  };

  // Handlers for alerts
  const addAlert = (type: AlertType = 'IMPORTANT') => {
    const newAlert: SkillAlert = {
      id: `alert-${Date.now()}`,
      type,
      title: '',
      content: '',
    };
    update({ alerts: [...(skill.alerts || []), newAlert] });
  };

  const updateAlert = (index: number, fields: Partial<SkillAlert>) => {
    const updated = [...(skill.alerts || [])];
    updated[index] = { ...updated[index], ...fields };
    update({ alerts: updated });
  };

  const removeAlert = (index: number) => {
    const updated = (skill.alerts || []).filter((_, idx) => idx !== index);
    update({ alerts: updated });
  };

  // Handlers for bundle files
  const addBundleFile = (folder: BundleFolder = 'scripts') => {
    const ext = folder === 'scripts' ? 'sh' : folder === 'references' ? 'md' : 'json';
    const newFile: SkillBundleFile = {
      id: `file-${Date.now()}`,
      folder,
      path: `${folder}/custom-${Date.now() % 1000}.${ext}`,
      content: folder === 'scripts' ? '#!/usr/bin/env bash\n\nif [ "$1" == "--help" ]; then\n  echo "Usage: $0 [args]"\n  exit 0\nfi\n' : '# Reference Documentation\n',
      description: 'Helper file for skill execution',
    };
    update({ bundleFiles: [...(skill.bundleFiles || []), newFile] });
  };

  const updateBundleFile = (index: number, fields: Partial<SkillBundleFile>) => {
    const updated = [...(skill.bundleFiles || [])];
    updated[index] = { ...updated[index], ...fields };
    update({ bundleFiles: updated });
  };

  const removeBundleFile = (index: number) => {
    const updated = (skill.bundleFiles || []).filter((_, idx) => idx !== index);
    update({ bundleFiles: updated });
  };

  return (
    <div className="skill-editor-container">
      {/* 1. AI Assistant Bar */}
      <div className="ai-prompt-card">
        <div className="ai-prompt-header">
          <div className="ai-badge">
            <SparklesIcon size={16} />
            <span>Generate with Gemini</span>
          </div>
          <span className="ai-hint">Powered by @google/genai (gemini-flash-latest)</span>
        </div>

        <form onSubmit={handleAiSubmit} className="ai-input-row">
          <input
            type="text"
            className="ai-input"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Create a skill for reviewing Dockerfiles and detecting security misconfigurations"
            disabled={isGenerating}
          />
          <button
            type="submit"
            className="btn-ai-generate"
            disabled={isGenerating || !aiPrompt.trim()}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <SparklesIcon size={16} />
                <span>Generate Skill</span>
              </>
            )}
          </button>
        </form>

        {promptError && (
          <div className="error-banner">
            <AlertTriangleIcon size={16} />
            <span>{promptError}</span>
            {!apiKey && (
              <button
                type="button"
                className="btn-link-action"
                onClick={onOpenApiKeyModal}
              >
                Configure Gemini Key &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Section Navigation Tabs */}
      <div className="editor-nav-tabs">
        <button
          type="button"
          className={`editor-tab ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          <ShieldIcon size={16} />
          <span>Metadata & Scope</span>
        </button>

        <button
          type="button"
          className={`editor-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          <TerminalIcon size={16} />
          <span>Instructions & Steps ({skill.steps?.length || 0})</span>
        </button>

        <button
          type="button"
          className={`editor-tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <span>Checklist & Alerts ({ (skill.checklist?.length || 0) + (skill.alerts?.length || 0) })</span>
        </button>

        <button
          type="button"
          className={`editor-tab ${activeTab === 'bundle' ? 'active' : ''}`}
          onClick={() => setActiveTab('bundle')}
        >
          <FolderIcon size={16} />
          <span>Directory Bundle ({skill.bundleFiles?.length || 0})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="editor-tab-content">
        {/* TAB 1: METADATA & SCOPE */}
        {activeTab === 'metadata' && (
          <div className="form-section">
            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="skill-title">Skill Title</label>
                <input
                  id="skill-title"
                  type="text"
                  className="input-field"
                  value={skill.title}
                  placeholder="e.g. Code Review Skill"
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = toKebabCase(newTitle);
                    update({
                      title: newTitle,
                      name: skill.name ? skill.name : autoSlug,
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <div className="label-with-badge">
                  <label htmlFor="skill-name">Skill Identifier (`name`)</label>
                  <span className="slash-badge">/{skill.name || 'skill'}</span>
                </div>
                <input
                  id="skill-name"
                  type="text"
                  className="input-field mono-font"
                  value={skill.name}
                  placeholder="e.g. code-review"
                  onChange={(e) => update({ name: toKebabCase(e.target.value) })}
                />
                <span className="field-hint">
                  Kebab-case only (lowercase, hyphens). Becomes the slash command in Antigravity.
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Target Scope & Location</label>
              <div className="scope-radio-group">
                <label className={`scope-card ${skill.scope === 'workspace' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="skill-scope"
                    value="workspace"
                    checked={skill.scope === 'workspace'}
                    onChange={() => update({ scope: 'workspace' })}
                  />
                  <div className="scope-info">
                    <strong>Workspace Skill</strong>
                    <code>.agents/skills/{skill.name || 'my-skill'}/</code>
                    <small>Scoped to this project, checked into git for team reuse.</small>
                  </div>
                </label>

                <label className={`scope-card ${skill.scope === 'global' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="skill-scope"
                    value="global"
                    checked={skill.scope === 'global'}
                    onChange={() => update({ scope: 'global' })}
                  />
                  <div className="scope-info">
                    <strong>Global Skill</strong>
                    <code>~/.gemini/config/skills/{skill.name || 'my-skill'}/</code>
                    <small>Available across all workspaces and projects on your machine.</small>
                  </div>
                </label>

                <label className={`scope-card ${skill.scope === 'plugin' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="skill-scope"
                    value="plugin"
                    checked={skill.scope === 'plugin'}
                    onChange={() => update({ scope: 'plugin' })}
                  />
                  <div className="scope-info">
                    <strong>Plugin Skill (CLI)</strong>
                    <code>~/.gemini/antigravity-cli/plugins/skills/</code>
                    <small>Packaged inside an Antigravity plugin bundle.</small>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-badge">
                <label htmlFor="skill-desc">Description (Frontmatter Trigger Criteria)</label>
                <span className="hint-pill">Third-person trigger</span>
              </div>
              <textarea
                id="skill-desc"
                rows={3}
                className="input-field"
                value={skill.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Reviews code changes for bugs, style issues, and best practices. Use when reviewing pull requests or checking code quality."
              />
              <div className="field-hint-flex">
                <span>
                  Tip: Write in third person (starts with "Reviews...", "Generates...", "Automates...") and include explicit "Use when..." conditions.
                </span>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={() => {
                    if (!skill.description.includes('Use when')) {
                      update({
                        description: skill.description
                          ? `${skill.description} Use when requested to perform this task.`
                          : 'Performs tasks for the agent. Use when requested.',
                      });
                    }
                  }}
                >
                  + Add "Use when..."
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="skill-overview">Overview & Purpose</label>
              <textarea
                id="skill-overview"
                rows={2}
                className="input-field"
                value={skill.overview}
                onChange={(e) => update({ overview: e.target.value })}
                placeholder="Brief summary of what the skill accomplishes and how it improves agent outcomes..."
              />
            </div>
          </div>
        )}

        {/* TAB 2: INSTRUCTIONS & WORKFLOW */}
        {activeTab === 'workflow' && (
          <div className="form-section">
            <div className="section-header-row">
              <div>
                <h4>Step-by-Step Instructions</h4>
                <p>Concrete, actionable protocol the agent follows when this skill activates.</p>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={addStep}>
                <PlusIcon size={14} />
                <span>Add Step</span>
              </button>
            </div>

            <div className="steps-list">
              {(skill.steps || []).map((step, idx) => (
                <div key={step.id || idx} className="step-card">
                  <div className="step-card-header">
                    <span className="step-badge">Step {idx + 1}</span>
                    <input
                      type="text"
                      className="input-field step-title-input"
                      value={step.title}
                      placeholder="Step Title (e.g. Inspect Diff and Changed Files)"
                      onChange={(e) => updateStep(idx, { title: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => removeStep(idx)}
                      title="Remove this step"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>

                  <div className="step-card-body">
                    <div className="form-group">
                      <label>Actions & Details</label>
                      <textarea
                        rows={2}
                        className="input-field"
                        value={step.description}
                        placeholder="Detailed instructions for the agent..."
                        onChange={(e) => updateStep(idx, { description: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label>Bash Command (Optional)</label>
                        <input
                          type="text"
                          className="input-field mono-font"
                          value={step.command || ''}
                          placeholder="git diff --stat origin/main...HEAD"
                          onChange={(e) => updateStep(idx, { command: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Verification / Acceptance Criteria</label>
                        <input
                          type="text"
                          className="input-field"
                          value={step.verification || ''}
                          placeholder="Confirm all modified files relate directly to the task."
                          onChange={(e) => updateStep(idx, { verification: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(skill.steps || []).length === 0 && (
                <div className="empty-placeholder" onClick={addStep}>
                  <TerminalIcon size={24} />
                  <p>No steps added yet. Click to add the first workflow step.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CHECKLIST & ALERTS */}
        {activeTab === 'checklist' && (
          <div className="form-section">
            <div className="section-header-row">
              <div>
                <h4>Review Checklist</h4>
                <p>Quality checks and standards the agent must verify before completing the task.</p>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={addChecklistItem}>
                <PlusIcon size={14} />
                <span>Add Checklist Item</span>
              </button>
            </div>

            <div className="checklist-items">
              {(skill.checklist || []).map((item, idx) => (
                <div key={item.id || idx} className="checklist-row">
                  <input
                    type="text"
                    className="input-field check-cat-input"
                    value={item.category || ''}
                    placeholder="Category (e.g. Correctness, Style)"
                    onChange={(e) => updateChecklistItem(idx, { category: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field check-text-input"
                    value={item.text}
                    placeholder="Check description (e.g. verify that all edge cases are handled)"
                    onChange={(e) => updateChecklistItem(idx, { text: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => removeChecklistItem(idx)}
                    title="Remove item"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))}

              {(skill.checklist || []).length === 0 && (
                <div className="empty-placeholder" onClick={addChecklistItem}>
                  <p>No checklist items. Click to add a quality check.</p>
                </div>
              )}
            </div>

            <hr className="form-divider" />

            <div className="section-header-row">
              <div>
                <h4>GitHub Callouts & Alerts</h4>
                <p>Highlight critical caveats, gotchas, or security warnings.</p>
              </div>
              <div className="alert-add-buttons">
                <button type="button" className="btn-tag btn-tag-important" onClick={() => addAlert('IMPORTANT')}>
                  + Important
                </button>
                <button type="button" className="btn-tag btn-tag-warning" onClick={() => addAlert('WARNING')}>
                  + Warning
                </button>
                <button type="button" className="btn-tag btn-tag-tip" onClick={() => addAlert('TIP')}>
                  + Tip
                </button>
              </div>
            </div>

            <div className="alerts-list">
              {(skill.alerts || []).map((alert, idx) => (
                <div key={alert.id || idx} className={`alert-card alert-${alert.type.toLowerCase()}`}>
                  <div className="alert-card-header">
                    <span className="alert-type-pill">{alert.type}</span>
                    <input
                      type="text"
                      className="input-field alert-title-input"
                      value={alert.title || ''}
                      placeholder="Title / Headline"
                      onChange={(e) => updateAlert(idx, { title: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => removeAlert(idx)}
                      title="Remove alert"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    className="input-field alert-content-input"
                    value={alert.content}
                    placeholder="Alert message details..."
                    onChange={(e) => updateAlert(idx, { content: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIRECTORY BUNDLE (AUXILIARY FILES) */}
        {activeTab === 'bundle' && (
          <div className="form-section">
            <div className="bundle-intro-card">
              <FolderIcon size={20} />
              <div>
                <strong>Anatomy of a Skill Bundle</strong>
                <p>
                  Skills are directory bundles. While <code>SKILL.md</code> is required, you can bundle helper scripts (<code>scripts/</code>), detailed documentation for progressive disclosure (<code>references/</code>), or templates (<code>resources/</code>).
                </p>
              </div>
            </div>

            <div className="section-header-row">
              <div>
                <h4>Auxiliary Files in Bundle</h4>
                <p>Files created alongside SKILL.md in the skill directory.</p>
              </div>
              <div className="alert-add-buttons">
                <button type="button" className="btn-secondary btn-sm" onClick={() => addBundleFile('scripts')}>
                  <PlusIcon size={14} /> Add Script
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => addBundleFile('references')}>
                  <PlusIcon size={14} /> Add Reference Doc
                </button>
              </div>
            </div>

            <div className="bundle-files-list">
              {(skill.bundleFiles || []).map((file, idx) => (
                <div key={file.id || idx} className="bundle-file-card">
                  <div className="bundle-file-header">
                    <FileIcon size={16} />
                    <input
                      type="text"
                      className="input-field mono-font file-path-input"
                      value={file.path}
                      placeholder="e.g. scripts/run.sh"
                      onChange={(e) => updateBundleFile(idx, { path: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input-field file-desc-input"
                      value={file.description || ''}
                      placeholder="Description / Purpose"
                      onChange={(e) => updateBundleFile(idx, { description: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => removeBundleFile(idx)}
                      title="Remove file"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                  <div className="bundle-file-editor">
                    <textarea
                      rows={5}
                      className="input-field mono-font file-content-textarea"
                      value={file.content}
                      placeholder="# File contents..."
                      onChange={(e) => updateBundleFile(idx, { content: e.target.value })}
                    />
                  </div>
                </div>
              ))}

              {(skill.bundleFiles || []).length === 0 && (
                <div className="empty-placeholder" onClick={() => addBundleFile('scripts')}>
                  <FolderIcon size={24} />
                  <p>No auxiliary files in bundle. Click to add a helper script or reference doc.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

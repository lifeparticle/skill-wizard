import React, { useState } from 'react';
import type { SkillData } from '../types/skill';
import { generateSkillMarkdown, getScopePath, toKebabCase } from '../utils/generator';
import { validateSkill } from '../utils/validator';
import { generateInstallCommand } from '../utils/terminal';
import {
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  TerminalIcon,
  FolderIcon,
  FileIcon,
  ShieldIcon,
  AlertTriangleIcon,
  LayersIcon,
} from './Icons';

interface PreviewPanelProps {
  skill: SkillData;
  onDownloadZip: () => void;
  onDownloadMarkdown: () => void;
  onCopyMarkdown: () => void;
  isCopied: boolean;
}

type PreviewTab = 'rendered' | 'raw' | 'tree' | 'terminal' | 'audit';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  skill,
  onDownloadZip,
  onDownloadMarkdown,
  onCopyMarkdown,
  isCopied,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('rendered');
  const [isCommandCopied, setIsCommandCopied] = useState(false);

  const markdown = generateSkillMarkdown(skill);
  const validation = validateSkill(skill);
  const installCmd = generateInstallCommand(skill);
  const safeName = toKebabCase(skill.name || 'my-skill');
  const scopePath = getScopePath(skill.scope, safeName, skill.pluginName);

  const copyCommand = () => {
    navigator.clipboard.writeText(installCmd);
    setIsCommandCopied(true);
    setTimeout(() => setIsCommandCopied(false), 2000);
  };

  return (
    <div className="preview-panel">
      {/* 1. Panel Header & Tab Controls */}
      <div className="preview-header">
        <div className="preview-tabs">
          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'rendered' ? 'active' : ''}`}
            onClick={() => setActiveTab('rendered')}
          >
            <span>Preview</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            <span>Raw SKILL.md</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveTab('tree')}
          >
            <FolderIcon size={14} />
            <span>Bundle Tree</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <TerminalIcon size={14} />
            <span>Terminal Script</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldIcon size={14} />
            <span>Audit ({validation.score}%)</span>
          </button>
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="btn-ghost-sm"
            onClick={onCopyMarkdown}
            title="Copy SKILL.md content"
          >
            {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="btn-ghost-sm"
            onClick={onDownloadMarkdown}
            title="Download SKILL.md"
          >
            <DownloadIcon size={14} />
            <span>SKILL.md</span>
          </button>

          <button
            type="button"
            className="btn-primary-sm"
            onClick={onDownloadZip}
            title="Download full directory bundle as ZIP"
          >
            <LayersIcon size={14} />
            <span>Zip Bundle</span>
          </button>
        </div>
      </div>

      {/* 2. Slash command banner */}
      <div className="slash-banner">
        <div className="slash-banner-left">
          <span className="slash-badge-lg">{validation.checks.slashCommand}</span>
          <span className="slash-target-path">{scopePath}</span>
        </div>
        <div className="slash-banner-right">
          <span className={`quality-pill score-${validation.score >= 80 ? 'good' : validation.score >= 50 ? 'med' : 'low'}`}>
            Quality: {validation.score}%
          </span>
        </div>
      </div>

      {/* 3. Panel Body */}
      <div className="preview-body">
        {/* TAB: RENDERED VIEW */}
        {activeTab === 'rendered' && (
          <div className="rendered-markdown-view">
            {/* Frontmatter Preview Card */}
            <div className="frontmatter-card">
              <div className="frontmatter-header">
                <span>YAML Frontmatter (AgentSkills Standard)</span>
              </div>
              <pre className="frontmatter-code">
{`---
name: ${safeName}
description: "${(skill.description || '').replace(/"/g, '\\"')}"
---`}
              </pre>
            </div>

            <h1 className="rendered-title">{skill.title || `${safeName} Skill`}</h1>

            {skill.overview && (
              <p className="rendered-overview">{skill.overview}</p>
            )}

            {skill.whenToUse && skill.whenToUse.length > 0 && (
              <div className="rendered-section">
                <h2>When to Use</h2>
                <ul>
                  {skill.whenToUse.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {skill.prerequisites && skill.prerequisites.length > 0 && (
              <div className="rendered-section">
                <h2>Prerequisites & Environment</h2>
                <ul>
                  {skill.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {(skill.alerts || []).map((alert, i) => (
              <div key={i} className={`github-alert github-alert-${alert.type.toLowerCase()}`}>
                <div className="github-alert-title">
                  <AlertTriangleIcon size={16} />
                  <span>{alert.type}: {alert.title || ''}</span>
                </div>
                <div className="github-alert-content">
                  {alert.content}
                </div>
              </div>
            ))}

            {(skill.steps || []).length > 0 && (
              <div className="rendered-section">
                <h2>Instructions & Workflow</h2>
                {(skill.steps || []).map((step, idx) => (
                  <div key={step.id || idx} className="rendered-step">
                    <h3>Step {idx + 1}: {step.title}</h3>
                    {step.description && <p>{step.description}</p>}
                    {step.command && (
                      <div className="rendered-cmd-block">
                        <pre><code>{step.command}</code></pre>
                      </div>
                    )}
                    {step.verification && (
                      <div className="rendered-verification">
                        <strong>Verification:</strong> {step.verification}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(skill.checklist || []).length > 0 && (
              <div className="rendered-section">
                <h2>Review Checklist</h2>
                <ul className="rendered-checklist">
                  {(skill.checklist || []).map((c, i) => (
                    <li key={c.id || i}>
                      {c.category ? <strong>{c.category}: </strong> : null}
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(skill.bundleFiles || []).filter((f) => f.folder === 'scripts').length > 0 && (
              <div className="rendered-section">
                <h2>Scripts & Black-Box Execution</h2>
                <div className="github-alert github-alert-tip">
                  <div className="github-alert-title">
                    <span>TIP: Black-box usage</span>
                  </div>
                  <div className="github-alert-content">
                    Always run helper scripts with <code>--help</code> first rather than reading the entire source code into context.
                  </div>
                </div>
                <ul>
                  {(skill.bundleFiles || [])
                    .filter((f) => f.folder === 'scripts')
                    .map((f, i) => (
                      <li key={i}>
                        <code>{f.path}</code> {f.description ? `— ${f.description}` : ''}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB: RAW MARKDOWN */}
        {activeTab === 'raw' && (
          <div className="raw-markdown-view">
            <div className="raw-stats-bar">
              <span>{validation.checks.lineCount} lines</span>
              <span>{new Blob([markdown]).size} bytes</span>
              <span className={validation.checks.under200Lines ? 'pill-success' : 'pill-warn'}>
                {validation.checks.under200Lines ? '✓ Progressive Disclosure OK (<200 lines)' : '⚠ >200 lines: Consider moving docs to references/'}
              </span>
            </div>
            <pre className="raw-code-block">
              <code>{markdown}</code>
            </pre>
          </div>
        )}

        {/* TAB: DIRECTORY BUNDLE TREE */}
        {activeTab === 'tree' && (
          <div className="tree-view-container">
            <div className="tree-header">
              <strong>Directory Bundle Layout</strong>
              <span>Scope: {skill.scope}</span>
            </div>

            <div className="file-tree">
              <div className="tree-node folder root">
                <FolderIcon size={16} />
                <span>{safeName}/</span>
                <span className="tree-scope-pill">{scopePath}</span>
              </div>

              <div className="tree-children">
                {/* SKILL.md */}
                <div className="tree-node file primary">
                  <FileIcon size={15} />
                  <span className="file-name">SKILL.md</span>
                  <span className="file-tag">Required Manifest</span>
                  <span className="file-meta">({validation.checks.lineCount} lines)</span>
                </div>

                {/* Optional folders */}
                {(['scripts', 'references', 'resources', 'examples'] as const).map((folder) => {
                  const files = (skill.bundleFiles || []).filter((f) => f.folder === folder);
                  if (files.length === 0) return null;
                  return (
                    <div key={folder} className="tree-folder-group">
                      <div className="tree-node folder">
                        <FolderIcon size={15} />
                        <span>{folder}/</span>
                        <span className="folder-count">({files.length} files)</span>
                      </div>
                      <div className="tree-children">
                        {files.map((file) => (
                          <div key={file.id} className="tree-node file">
                            <FileIcon size={14} />
                            <span className="file-name">{file.path.replace(`${folder}/`, '')}</span>
                            {file.description && <span className="file-desc">— {file.description}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bundle-tree-footer">
              <p>
                This directory bundle can be exported as a ZIP or created directly in your workspace with the terminal script.
              </p>
            </div>
          </div>
        )}

        {/* TAB: TERMINAL INSTALLER */}
        {activeTab === 'terminal' && (
          <div className="terminal-view-container">
            <div className="terminal-header-bar">
              <div>
                <strong>Bash / Zsh Setup Script</strong>
                <p>Paste this command into your terminal to scaffold the entire skill bundle locally:</p>
              </div>
              <button
                type="button"
                className="btn-primary-sm"
                onClick={copyCommand}
              >
                {isCommandCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                <span>{isCommandCopied ? 'Copied Command!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="terminal-code-block">
              <code>{installCmd}</code>
            </pre>
          </div>
        )}

        {/* TAB: AUDIT & COMPLIANCE */}
        {activeTab === 'audit' && (
          <div className="audit-view-container">
            <div className="audit-score-hero">
              <div className="score-circle">
                <span className="score-num">{validation.score}</span>
                <span className="score-denom">/100</span>
              </div>
              <div className="score-details">
                <h3>skill.md Standards Compliance</h3>
                <p>
                  Evaluates adherence to the AgentSkills specification and Antigravity progressive disclosure protocols.
                </p>
              </div>
            </div>

            <div className="audit-checklist">
              <div className={`audit-item ${validation.checks.nameKebabCase ? 'pass' : 'fail'}`}>
                <span className="audit-icon">{validation.checks.nameKebabCase ? '✓' : '✗'}</span>
                <div>
                  <strong>Kebab-case Name: <code>{safeName}</code></strong>
                  <p>Enables clean slash command invocation (<code>{validation.checks.slashCommand}</code>).</p>
                </div>
              </div>

              <div className={`audit-item ${validation.checks.hasDescription ? 'pass' : 'fail'}`}>
                <span className="audit-icon">{validation.checks.hasDescription ? '✓' : '✗'}</span>
                <div>
                  <strong>Trigger Description Present</strong>
                  <p>Required for autonomous progressive disclosure and activation.</p>
                </div>
              </div>

              <div className={`audit-item ${validation.checks.thirdPersonDescription ? 'pass' : 'warn'}`}>
                <span className="audit-icon">{validation.checks.thirdPersonDescription ? '✓' : '!'}</span>
                <div>
                  <strong>Third-person Description Phrasing</strong>
                  <p>Should begin with an action verb (e.g., "Reviews...", "Generates...", "Automates...").</p>
                </div>
              </div>

              <div className={`audit-item ${validation.checks.hasTriggerKeywords ? 'pass' : 'warn'}`}>
                <span className="audit-icon">{validation.checks.hasTriggerKeywords ? '✓' : '!'}</span>
                <div>
                  <strong>Trigger Keywords Included</strong>
                  <p>Phrases like "Use when..." ensure the agent matches relevant user requests accurately.</p>
                </div>
              </div>

              <div className={`audit-item ${validation.checks.hasWorkflowSteps ? 'pass' : 'warn'}`}>
                <span className="audit-icon">{validation.checks.hasWorkflowSteps ? '✓' : '!'}</span>
                <div>
                  <strong>Actionable Steps Configured ({skill.steps?.length || 0} steps)</strong>
                  <p>Provides explicit instructions and verification commands for the agent.</p>
                </div>
              </div>

              <div className={`audit-item ${validation.checks.under200Lines ? 'pass' : 'warn'}`}>
                <span className="audit-icon">{validation.checks.under200Lines ? '✓' : '!'}</span>
                <div>
                  <strong>Progressive Disclosure Line Count ({validation.checks.lineCount} lines)</strong>
                  <p>Recommended under 200 lines. Heavy schemas or references belong in auxiliary files.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

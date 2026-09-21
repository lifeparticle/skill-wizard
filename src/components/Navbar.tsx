import React from 'react';
import { KeyIcon, DownloadIcon, CopyIcon, CheckIcon, PlusIcon, SparklesIcon } from './Icons';
import { SKILL_TEMPLATES } from '../data/templates';
import type { SkillData } from '../types/skill';

interface NavbarProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  onSelectTemplate: (templateId: string) => void;
  onNewSkill: () => void;
  onDownloadZip: () => void;
  onCopyMarkdown: () => void;
  isCopied: boolean;
  activeSkill: SkillData;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiKey,
  onOpenApiKeyModal,
  onSelectTemplate,
  onNewSkill,
  onDownloadZip,
  onCopyMarkdown,
  isCopied,
  activeSkill,
}) => {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-logo">
          <div className="brand-icon">
            <SparklesIcon size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Antigravity Skill Studio</span>
            <span className="brand-subtitle">AgentSkills Open Standard</span>
          </div>
        </div>

        <div className="nav-divider" />

        <div className="template-dropdown-wrapper">
          <label htmlFor="template-select" className="sr-only">Choose Template</label>
          <select
            id="template-select"
            className="template-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onSelectTemplate(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>Load from Template...</option>
            {SKILL_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.label} ({tpl.badge})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-nav-action"
          onClick={onNewSkill}
          title="Create fresh empty skill"
        >
          <PlusIcon size={16} />
          <span>New Skill</span>
        </button>
      </div>

      <div className="nav-right">
        <div className="model-chip" title="Active AI model configured for generation">
          <span className="model-indicator" />
          <span className="model-name">gemini-flash-latest</span>
        </div>

        <button
          type="button"
          className={`btn-api-key ${apiKey ? 'configured' : 'needed'}`}
          onClick={onOpenApiKeyModal}
          title={
            apiKey
              ? 'Gemini API Key configured — click to update'
              : 'No API key found — click to enter your Gemini API Key'
          }
        >
          <KeyIcon size={16} />
          <span>{apiKey ? 'API Key Set' : 'Enter API Key'}</span>
        </button>

        <div className="nav-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCopyMarkdown}
            title="Copy formatted SKILL.md"
          >
            {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            <span>{isCopied ? 'Copied!' : 'Copy SKILL.md'}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onDownloadZip}
            title={`Download ${activeSkill.name || 'skill'} bundle as ZIP`}
          >
            <DownloadIcon size={16} />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};

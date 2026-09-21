import { useState, useEffect, useTransition } from 'react';
import type { SkillData } from './types/skill';
import { SKILL_TEMPLATES } from './data/templates';
import { generateSkillWithGemini } from './utils/gemini';
import { generateSkillMarkdown, toKebabCase } from './utils/generator';
import { createZip, downloadBlob } from './utils/zip';
import { Navbar } from './components/Navbar';
import { SkillForm } from './components/SkillForm';
import { PreviewPanel } from './components/PreviewPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import './App.css';

function App() {
  // Active skill state, initialized to the canonical code-review template from skill.md
  const [skill, setSkill] = useState<SkillData>(SKILL_TEMPLATES[0].data);

  // Gemini API Key management
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      localStorage.getItem('gemini_api_key') ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      ''
    );
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(() => !apiKey);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const found = SKILL_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setSkill(JSON.parse(JSON.stringify(found.data)));
    }
  };

  const handleNewSkill = () => {
    const blank = SKILL_TEMPLATES.find((t) => t.id === 'blank');
    if (blank) {
      setSkill(JSON.parse(JSON.stringify(blank.data)));
    }
  };

  const handleGenerateWithGemini = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const generated = await generateSkillWithGemini({
        apiKey,
        userPrompt: prompt,
        model: 'gemini-flash-latest',
        targetScope: skill.scope,
      });

      startTransition(() => {
        setSkill(generated);
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    const markdown = generateSkillMarkdown(skill);
    navigator.clipboard.writeText(markdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateSkillMarkdown(skill);
    const safeName = toKebabCase(skill.name || 'skill');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${safeName}-SKILL.md`);
  };

  const handleDownloadZip = () => {
    const safeName = toKebabCase(skill.name || 'skill');
    const markdown = generateSkillMarkdown(skill);

    const entries = [
      {
        filename: `${safeName}/SKILL.md`,
        content: markdown,
      },
    ];

    if (skill.bundleFiles && skill.bundleFiles.length > 0) {
      for (const file of skill.bundleFiles) {
        entries.push({
          filename: `${safeName}/${file.path}`,
          content: file.content,
        });
      }
    }

    const zipBlob = createZip(entries);
    downloadBlob(zipBlob, `${safeName}-skill-bundle.zip`);
  };

  // Keyboard shortcut: Cmd/Ctrl + K opens API key modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsApiKeyModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      <Navbar
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onSelectTemplate={handleSelectTemplate}
        onNewSkill={handleNewSkill}
        onDownloadZip={handleDownloadZip}
        onCopyMarkdown={handleCopyMarkdown}
        isCopied={isCopied}
        activeSkill={skill}
      />

      <main className="main-content-grid">
        <section className="column-editor">
          <SkillForm
            skill={skill}
            onChange={setSkill}
            onGenerateWithGemini={handleGenerateWithGemini}
            isGenerating={isGenerating}
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        </section>

        <section className="column-preview">
          <PreviewPanel
            skill={skill}
            onDownloadZip={handleDownloadZip}
            onDownloadMarkdown={handleDownloadMarkdown}
            onCopyMarkdown={handleCopyMarkdown}
            isCopied={isCopied}
          />
        </section>
      </main>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}

export default App;

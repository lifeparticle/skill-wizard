import React, { useEffect, useState } from 'react';
import { KeyIcon, CheckIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  apiKey,
  onSave,
  onClose,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(apiKey);
      setSaved(false);
      setShowKey(false);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <KeyIcon size={20} />
            </div>
            <div>
              <h3>{apiKey ? 'Update Gemini API Key' : 'Enter Gemini API Key'}</h3>
              <p>
                {apiKey
                  ? 'Your key is saved in this browser. Update or clear it below.'
                  : 'No key found in .env.local — paste your Gemini API key to start generating skills.'}
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label htmlFor="gemini-key-input">Gemini API Key</label>
            <div className="input-group">
              <input
                id="gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                autoFocus
                className="input-field"
              />
              <button
                type="button"
                className="btn-toggle-view"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="field-hint">
              Your key is saved only in your local browser storage (localStorage) and sent directly to Google GenAI API.
            </div>
          </div>

          <div className="callout-info">
            <div className="callout-text">
              <strong>Need an API Key?</strong>
              <p>
                Get a free Gemini API key from Google AI Studio in just 10 seconds:
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="ext-link"
              >
                Get API Key from Google AI Studio &rarr;
              </a>
            </div>
          </div>

          <div className="modal-actions">
            {keyInput && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setKeyInput('');
                  onSave('');
                }}
              >
                Clear Key
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {saved ? (
                <>
                  <CheckIcon size={16} /> Saved!
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

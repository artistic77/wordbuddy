import React, { useState } from 'react';
import { X, Sparkles, Globe, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, isPublic: boolean) => Promise<void>;
}

export const CreateSetModal: React.FC<CreateSetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the vocabulary set.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(title.trim(), description.trim(), isPublic);
      setTitle('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to create set.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto max-h-[calc(100dvh-2.5rem)]">
        <Card className="p-6 sm:p-8 shadow-modal border-primary/20 relative max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-outfit font-bold text-text-primary">Create New Vocab Set</h2>
              <p className="text-xs text-text-secondary">Organize words into study decks & units.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-secondary-light border border-secondary/20 text-xs text-secondary">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Set Title"
              placeholder="e.g. Unit 3 — Animals & Nature"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Description (Optional)
              </label>
              <textarea
                className="w-full h-24 p-3 rounded-input bg-white border border-border text-text-primary text-sm transition-all duration-200 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Brief summary of what vocabulary is in this set..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-text-secondary" />
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {isPublic ? 'Public Set' : 'Private Set'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {isPublic
                      ? 'Anyone can discover and copy this set in Explore.'
                      : 'Only you can view and study this set.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Create Set
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

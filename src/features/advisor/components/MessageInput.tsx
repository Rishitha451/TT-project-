import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 500;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask your financial question..."
          rows={1}
          aria-label="Financial question prompt input"
          className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
        />

        <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] font-medium text-slate-400">
            {input.length}/{MAX_CHARS}
          </span>

          <div className="pointer-events-auto">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={disabled || !input.trim()}
              className="h-8 px-3 rounded-lg text-xs"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

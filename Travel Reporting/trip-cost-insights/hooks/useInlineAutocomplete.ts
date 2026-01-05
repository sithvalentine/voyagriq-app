import { useState, useEffect, useRef } from 'react';

interface UseInlineAutocompleteProps {
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
}

export function useInlineAutocomplete({ value, suggestions, onChange }: UseInlineAutocompleteProps) {
  const [suggestion, setSuggestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setSuggestion('');
      return;
    }

    // Find first matching suggestion (case-insensitive)
    const match = suggestions.find(s =>
      s.toLowerCase().startsWith(value.toLowerCase()) &&
      s.toLowerCase() !== value.toLowerCase()
    );

    setSuggestion(match || '');
  }, [value, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Accept suggestion with Tab or Right Arrow
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
      e.preventDefault();
      onChange(suggestion);
      setSuggestion('');
    }
  };

  return {
    suggestion,
    inputRef,
    handleKeyDown,
  };
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useMapStore } from '@/store/map.store';
import { usePOISearch } from '@/hooks/usePOISearch';
import { useLocationStore } from '@/store/location.store';
import { cn } from '@/lib/utils';

interface Suggestion {
  placeId: string;
  text: string;
  secondaryText?: string;
}

export default function SearchBar() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const sessionTokenRef = useRef(uuidv4());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { mapInstance } = useMapStore();
  const { search } = usePOISearch();
  const location = useLocationStore();

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const body: Record<string, unknown> = {
          input,
          sessionToken: sessionTokenRef.current,
        };
        if (location.coordinates) {
          body.locationBias = location.coordinates;
        }

        const res = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
        }
      } catch {
        // ignore search errors
      }
    },
    [location.coordinates],
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    return () => clearTimeout(debounceRef.current);
  }, [value, fetchSuggestions]);

  const selectSuggestion = async (suggestion: Suggestion) => {
    setValue(suggestion.text);
    setSuggestions([]);
    sessionTokenRef.current = uuidv4(); // Reset session token

    try {
      const res = await fetch(`/api/places/details?placeId=${suggestion.placeId}`);
      if (res.ok) {
        const poi = await res.json();
        if (mapInstance && poi.coordinates) {
          mapInstance.panTo(poi.coordinates);
          mapInstance.setZoom(14);
          search(poi.coordinates, true);
        }
      }
    } catch {
      // ignore
    }
  };

  const clear = () => {
    setValue('');
    setSuggestions([]);
  };

  return (
    <div className="relative flex-1">
      <div
        className={cn(
          'flex items-center gap-2 h-11 px-3 rounded-xl border',
          'bg-[var(--color-surface)] border-[var(--color-border)]',
          isFocused && 'border-[var(--color-accent)]',
        )}
      >
        <Search size={16} className="text-[var(--color-text-muted)] shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Search places…"
          className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-sm outline-none"
          aria-label="Search places"
          autoComplete="off"
        />
        {value && (
          <button onClick={clear} aria-label="Clear search" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <X size={14} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && isFocused && (
        <ul className="absolute top-full mt-1 left-0 right-0 z-30 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                onMouseDown={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="text-sm text-[var(--color-text-primary)] truncate">{s.text}</div>
                {s.secondaryText && (
                  <div className="text-xs text-[var(--color-text-muted)] truncate">{s.secondaryText}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

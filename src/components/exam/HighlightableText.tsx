'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Highlighter, X } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';

interface HighlightableTextProps {
  paragraphId: string;
  html: string;
}

const EMPTY_HIGHLIGHTS: string[] = [];

export function HighlightableText({ paragraphId, html }: HighlightableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawHighlights = useExamStore((state) => state.highlights[paragraphId]);
  const highlights = rawHighlights || EMPTY_HIGHLIGHTS;
  const addHighlight = useExamStore((state) => state.addHighlight);
  const removeHighlight = useExamStore((state) => state.removeHighlight);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#ielts-highlight-menu')) {
        setMenuPos(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPos(null);
      }
    };

    window.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const rawSelected = selection ? selection.toString().trim() : '';

    if (rawSelected.length > 0) {
      setSelectedText(rawSelected);
      setMenuPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const target = e.target as HTMLElement;
    if (target && target.tagName.toLowerCase() === 'mark') {
      const markText = target.innerText.trim();
      if (markText.length > 0) {
        setSelectedText(markText);
        setMenuPos({ x: e.clientX, y: e.clientY });
        return;
      }
    }

    setMenuPos(null);
  };

  const processedHtml = useMemo(() => {
    if (!html) return '';
    if (!highlights || highlights.length === 0) return html;

    let result = html;
    const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

    for (const hText of sortedHighlights) {
      if (!hText || !hText.trim()) continue;
      const escaped = hText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?![^<]*>)(${escaped})`, 'gi');
      result = result.replace(
        regex,
        '<mark class="bg-yellow-300 text-neutral-900 px-0.5 rounded-sm cursor-pointer">$1</mark>'
      );
    }
    return result;
  }, [html, highlights]);

  const handleApplyHighlight = () => {
    if (selectedText) {
      addHighlight(paragraphId, selectedText);
    }
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleClearHighlight = () => {
    if (selectedText) {
      removeHighlight(paragraphId, selectedText);
    }
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed select-text"
      />

      {menuPos && (
        <div
          id="ielts-highlight-menu"
          style={{
            top: `${menuPos.y}px`,
            left: `${menuPos.x}px`,
          }}
          className="fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl py-1 text-xs text-neutral-200 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={handleApplyHighlight}
            className="w-full text-left px-3 py-2 hover:bg-neutral-800 flex items-center gap-2 text-yellow-300 font-medium transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
            Highlight (Yellow)
          </button>
          <button
            type="button"
            onClick={handleClearHighlight}
            className="w-full text-left px-3 py-2 hover:bg-neutral-800 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors border-t border-neutral-800"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" />
            Clear Highlight
          </button>
        </div>
      )}
    </div>
  );
}
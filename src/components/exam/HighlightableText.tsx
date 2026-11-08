'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Highlighter, StickyNote, Trash2, X } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { StickyNoteItem } from '@/lib/types';

interface HighlightableTextProps {
  paragraphId: string;
  html: string;
}

const EMPTY_HIGHLIGHTS: string[] = [];
const EMPTY_NOTES: StickyNoteItem[] = [];

export function HighlightableText({ paragraphId, html }: HighlightableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawHighlights = useExamStore((state) => state.highlights[paragraphId]);
  const highlights = rawHighlights || EMPTY_HIGHLIGHTS;
  const rawNotes = useExamStore((state) => state.notes?.[paragraphId]);
  const notes = rawNotes || EMPTY_NOTES;

  const addHighlight = useExamStore((state) => state.addHighlight);
  const removeHighlight = useExamStore((state) => state.removeHighlight);
  const addNote = useExamStore((state) => state.addNote);
  const removeNote = useExamStore((state) => state.removeNote);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [draftNote, setDraftNote] = useState<string>('');

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
        setIsNoteModalOpen(false);
      }
    };

    window.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openMenuAtCoords = (clientX: number, clientY: number, text: string) => {
    const safeX = Math.min(Math.max(12, clientX), typeof window !== 'undefined' ? window.innerWidth - 200 : clientX);
    const safeY = Math.min(Math.max(12, clientY), typeof window !== 'undefined' ? window.innerHeight - 150 : clientY);
    setSelectedText(text);
    setMenuPos({ x: safeX, y: safeY });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const rawSelected = selection ? selection.toString().trim() : '';

    if (rawSelected.length >= 2) {
      openMenuAtCoords(e.clientX, e.clientY, rawSelected);
      return;
    }

    const target = e.target as HTMLElement;
    if (target && target.tagName.toLowerCase() === 'mark') {
      const markText = target.innerText.trim();
      if (markText.length > 0) {
        openMenuAtCoords(e.clientX, e.clientY, markText);
        return;
      }
    }

    setMenuPos(null);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      const rawSelected = selection ? selection.toString().trim() : '';
      if (rawSelected.length >= 2 && selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        openMenuAtCoords(rect.left + rect.width / 2 - 80, rect.bottom + 8, rawSelected);
      }
    }, 150);
  };

  const processedHtml = useMemo(() => {
    if (!html) return '';
    if (!highlights || highlights.length === 0) return html;

    let result = html;
    const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

    for (const hText of sortedHighlights) {
      if (!hText || hText.trim().length < 2) continue;
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

  const handleOpenNoteDialog = () => {
    setMenuPos(null);
    setDraftNote('');
    setIsNoteModalOpen(true);
    window.getSelection()?.removeAllRanges();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedText && draftNote.trim()) {
      addHighlight(paragraphId, selectedText);
      addNote(paragraphId, selectedText, draftNote.trim());
    }
    setIsNoteModalOpen(false);
    setDraftNote('');
  };

  const handleClearHighlight = () => {
    if (selectedText) {
      removeHighlight(paragraphId, selectedText);
    }
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="relative space-y-4">
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        onTouchEnd={handleTouchEnd}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed select-text text-sm sm:text-base"
      />

      {notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            Passage Sticky Notes ({notes.length})
          </span>
          <div className="grid grid-cols-1 gap-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs flex items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="italic text-slate-500 dark:text-slate-400 line-clamp-1">
                    &ldquo;{n.quote}&rdquo;
                  </div>
                  <div className="font-medium text-slate-900 dark:text-amber-100">
                    {n.noteText}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeNote(paragraphId, n.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuPos && (
        <div
          id="ielts-highlight-menu"
          style={{
            top: `${menuPos.y}px`,
            left: `${menuPos.x}px`,
          }}
          className="fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 text-xs text-slate-200 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={handleApplyHighlight}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-yellow-300 font-medium transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
            Highlight (Yellow)
          </button>
          <button
            type="button"
            onClick={handleOpenNoteDialog}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-amber-300 font-medium transition-colors border-t border-slate-800"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-400" />
            Add Sticky Note
          </button>
          <button
            type="button"
            onClick={handleClearHighlight}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition-colors border-t border-slate-800"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            Clear Highlight
          </button>
        </div>
      )}

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNote}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 text-white shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <StickyNote className="w-4 h-4" />
                Add Sticky Note
              </h4>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded border border-slate-800 line-clamp-2">
              &ldquo;{selectedText}&rdquo;
            </div>
            <textarea
              required
              autoFocus
              rows={3}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Write your note for this passage excerpt..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

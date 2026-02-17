import React from 'react';

// Configure which chapters to display (use null or empty array to show all)
const VISIBLE_CHAPTERS = [1, 2, 3, 4];

const CHAPTERS_META = [
  { id: 1, title: 'Introduction', subtitle: 'Why Study Programming Languages?', color: '#f97316' },
  { id: 2, title: 'Programming Language Syntax', subtitle: 'From Characters to Parse Trees', color: '#8b5cf6' },
  { id: 3, title: 'Names, Scopes, and Bindings', subtitle: 'The Foundation of Program Organization', color: '#06b6d4' },
  { id: 4, title: 'Semantic Analysis', subtitle: 'Understanding Program Meaning', color: '#10b981' },
  { id: 5, title: 'Target Machine Architecture', subtitle: 'Data in Memory', color: '#f59e0b' },
  { id: 6, title: 'Control Flow', subtitle: 'Conditionals, Loops, and Jumps', color: '#ec4899' },
  { id: 7, title: 'Type Systems', subtitle: 'Static and Dynamic Typing', color: '#6366f1' },
  { id: 8, title: 'Composite Types', subtitle: 'Records, Arrays, and Unions', color: '#14b8a6' },
  { id: 9, title: 'Subroutines', subtitle: 'Calls, Stack, and Activation', color: '#f43f5e' },
  { id: 10, title: 'Object-Oriented Programming', subtitle: 'Classes and Inheritance', color: '#8b5cf6' },
  { id: 11, title: 'Functional Programming', subtitle: 'First-Class Functions', color: '#22c55e' },
  { id: 12, title: 'Logic Programming', subtitle: 'Unification and Resolution', color: '#3b82f6' },
];

export default function ChaptersList({ onSelectChapter }) {
  const visibleChapters = VISIBLE_CHAPTERS?.length > 0
    ? CHAPTERS_META.filter(ch => VISIBLE_CHAPTERS.includes(ch.id))
    : CHAPTERS_META;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Programming Language Pragmatics</h1>
          <p className="text-slate-400 text-sm mt-1">Fourth Edition — Michael L. Scott • Interactive Slides</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-2">Chapters</h2>
        <p className="text-slate-400 mb-10">Select a chapter to view its slides.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleChapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className="group text-left rounded-xl bg-slate-800/80 border border-slate-700 p-6 hover:border-slate-500 hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold text-white mb-4" style={{ backgroundColor: ch.color }}>{ch.id}</div>
              <h3 className="text-xl font-bold text-white group-hover:opacity-90" style={{ color: ch.color }}>Chapter {ch.id}: {ch.title}</h3>
              {ch.subtitle && <p className="text-slate-400 text-sm mt-2">{ch.subtitle}</p>}
              <p className="text-slate-500 text-xs mt-3">View slides →</p>
            </button>
          ))}
        </div>
      </main>
      <footer className="border-t border-slate-700 mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Use arrow keys or on-screen controls to navigate. Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">M</kbd> for menu.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Dr. Qi Li. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

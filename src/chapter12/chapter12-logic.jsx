import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 12: LOGIC LANGUAGES
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 12,
  title: "Logic Languages",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#3b82f6" // blue
};

// ============================================================================
// SLIDE DATA
// ============================================================================
const SLIDES = [
  // TITLE
  {
    id: 1,
    section: "intro",
    type: "title",
    title: "Chapter 12: Logic Languages",
    content: {
      subtitle: "Programming with Predicates and Proofs",
      topics: [
        "Predicate Calculus",
        "Horn Clauses",
        "Prolog",
        "Unification",
        "Backtracking",
        "Resolution"
      ]
    }
  },

  // LOGIC PROGRAMMING CONCEPT
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Logic Programming",
    content: {
      description: "Based on predicate calculus - a different way to compute:",
      items: [
        { icon: "📝", text: "Declarative", detail: "Describe WHAT to compute, not HOW" },
        { icon: "🔍", text: "Predicates", detail: "State relationships: parent(tom, mary)" },
        { icon: "🎯", text: "Goals", detail: "Ask questions, system finds answers" },
        { icon: "🧠", text: "Inference", detail: "Computer reasons from facts and rules" }
      ]
    }
  },

  // PREDICATES
  {
    id: 3,
    section: "intro",
    type: "concept",
    title: "Predicates",
    content: {
      description: "Building blocks of logic programming:",
      items: [
        { icon: "📦", text: "Structure", detail: "functor(arg1, arg2, ..., argN)" },
        { icon: "✓", text: "True or False", detail: "Predicates assert relationships" },
        { icon: "🔗", text: "Meaning", detail: "We attach meaning; system just manipulates symbols" }
      ],
      code: `% Examples of predicates
parent(tom, mary).     % tom is parent of mary
enrolled(you, cs101).  % you are enrolled in cs101
rainy(seattle).        % seattle is rainy`
    }
  },

  // HORN CLAUSES
  {
    id: 4,
    section: "concepts",
    type: "concept",
    title: "Horn Clauses",
    content: {
      description: "The restricted form that makes logic programming practical:",
      items: [
        { icon: "📄", text: "Fact", detail: "Head only: parent(tom, mary)." },
        { icon: "📐", text: "Rule", detail: "Head :- Body: grandparent(X,Z) :- parent(X,Y), parent(Y,Z)." },
        { icon: "❓", text: "Query", detail: "Body only: ?- parent(tom, X)." }
      ],
      note: "Body terms are AND-ed together; :- means 'if'"
    },
    interactive: { type: "horn-clauses" }
  },

  // FACTS AND RULES
  {
    id: 5,
    section: "concepts",
    type: "concept",
    title: "Facts and Rules",
    content: {
      description: "Building a knowledge base:",
      items: [
        { icon: "📝", text: "Facts", detail: "Axioms - things assumed true" },
        { icon: "📐", text: "Rules", detail: "Theorems - how to derive new facts" },
        { icon: "🔠", text: "Variables", detail: "Uppercase: X, Y, Person (can match anything)" },
        { icon: "🔡", text: "Constants", detail: "Lowercase: tom, mary, 42 (specific values)" }
      ],
      code: `% Facts (axioms)
parent(tom, mary).
parent(tom, john).
parent(mary, ann).

% Rule (theorem)
grandparent(X, Z) :- 
    parent(X, Y), 
    parent(Y, Z).`
    }
  },

  // PROLOG OVERVIEW
  {
    id: 6,
    section: "prolog",
    type: "concept",
    title: "Prolog",
    content: {
      description: "The most widely used logic programming language:",
      items: [
        { icon: "📚", text: "Database", detail: "Collection of facts and rules" },
        { icon: "❓", text: "Queries", detail: "Ask questions, get answers" },
        { icon: "🔄", text: "Backward Chaining", detail: "Start from goal, work back to facts" },
        { icon: "↩️", text: "Backtracking", detail: "Try alternatives when stuck" }
      ]
    }
  },

  // UNIFICATION
  {
    id: 7,
    section: "prolog",
    type: "concept",
    title: "Unification",
    content: {
      description: "The key operation - matching and binding:",
      items: [
        { icon: "🔗", text: "Pattern Matching", detail: "Make two terms identical" },
        { icon: "📥", text: "Instantiation", detail: "Bind variables to values" },
        { icon: "=", text: "Unification Operator", detail: "X = term tries to unify" }
      ],
      code: `?- foo(X, b) = foo(a, Y).
X = a, Y = b.    % Success!

?- foo(X, X) = foo(a, b).
no.              % Fails: X can't be both a and b`
    },
    interactive: { type: "unification" }
  },

  // RESOLUTION
  {
    id: 8,
    section: "prolog",
    type: "concept",
    title: "Resolution",
    content: {
      description: "How Prolog proves goals:",
      items: [
        { icon: "🎯", text: "Goal", detail: "What we want to prove" },
        { icon: "🔍", text: "Search", detail: "Find rule whose head unifies with goal" },
        { icon: "➡️", text: "Replace", detail: "Replace goal with body of rule" },
        { icon: "✓", text: "Success", detail: "When all goals become facts" }
      ]
    },
    interactive: { type: "resolution" }
  },

  // BACKTRACKING
  {
    id: 9,
    section: "prolog",
    type: "concept",
    title: "Backtracking",
    content: {
      description: "Systematic search for solutions:",
      items: [
        { icon: "🌳", text: "Search Tree", detail: "All possible proof paths" },
        { icon: "⬇️", text: "Depth-First", detail: "Try first option, go deep" },
        { icon: "↩️", text: "Backtrack", detail: "On failure, undo and try next option" },
        { icon: "🔄", text: "Multiple Solutions", detail: "Keep backtracking to find all" }
      ]
    },
    interactive: { type: "backtracking" }
  },

  // FAMILY DATABASE EXAMPLE
  {
    id: 10,
    section: "examples",
    type: "concept",
    title: "Example: Family Relations",
    content: {
      description: "Classic Prolog example:",
      code: `% Facts
parent(tom, mary).
parent(tom, john).
parent(mary, ann).
parent(mary, pat).
parent(john, jim).

% Rules  
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
sibling(X, Y) :- parent(P, X), parent(P, Y), X \\= Y.
ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).`
    },
    interactive: { type: "family-tree" }
  },

  // QUERIES
  {
    id: 11,
    section: "examples",
    type: "concept",
    title: "Asking Questions",
    content: {
      description: "Running queries against the database:",
      items: [
        { icon: "❓", text: "Yes/No Question", detail: "?- parent(tom, mary). → yes" },
        { icon: "🔍", text: "Find Values", detail: "?- parent(tom, X). → X = mary; X = john" },
        { icon: "🔄", text: "Multiple Answers", detail: "Press ; to get more solutions" }
      ],
      code: `?- grandparent(tom, X).
X = ann ;
X = pat ;
X = jim ;
no

?- ancestor(tom, jim).
yes`
    }
  },

  // LISTS IN PROLOG
  {
    id: 12,
    section: "examples",
    type: "concept",
    title: "Lists in Prolog",
    content: {
      description: "The primary data structure:",
      items: [
        { icon: "📋", text: "Syntax", detail: "[1, 2, 3] or [Head | Tail]" },
        { icon: "✂️", text: "Pattern Match", detail: "[H|T] splits into head and tail" },
        { icon: "📦", text: "Empty List", detail: "[] is the empty list" }
      ],
      code: `% List membership
member(X, [X|_]).
member(X, [_|T]) :- member(X, T).

% Append lists
append([], L, L).
append([H|T], L, [H|R]) :- append(T, L, R).

?- append([1,2], [3,4], X).
X = [1, 2, 3, 4]`
    },
    interactive: { type: "lists" }
  },

  // ARITHMETIC
  {
    id: 13,
    section: "examples",
    type: "concept",
    title: "Arithmetic in Prolog",
    content: {
      description: "Special handling needed for math:",
      items: [
        { icon: "=", text: "= (unify)", detail: "Pattern matching, NOT evaluation" },
        { icon: "🔢", text: "is (evaluate)", detail: "X is 2+3 evaluates to X = 5" },
        { icon: "⚠️", text: "Gotcha", detail: "2+3 = 5 fails! (different structures)" }
      ],
      code: `?- X = 2 + 3.
X = 2+3        % Just unifies, no math!

?- X is 2 + 3.
X = 5          % Evaluates the expression

?- 2 + 3 = 5.
no             % Structure 2+3 ≠ atom 5`
    }
  },

  // ORDER MATTERS
  {
    id: 14,
    section: "semantics",
    type: "concept",
    title: "Order Matters!",
    content: {
      description: "Prolog is NOT purely declarative:",
      items: [
        { icon: "📋", text: "Database Order", detail: "Rules tried top to bottom" },
        { icon: "➡️", text: "Goal Order", detail: "Subgoals tried left to right" },
        { icon: "♾️", text: "Infinite Loops", detail: "Wrong order can cause non-termination" }
      ],
      code: `% This works:
ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).

% This loops infinitely:
ancestor(X, Y) :- ancestor(Z, Y), parent(X, Z).
ancestor(X, Y) :- parent(X, Y).`
    }
  },

  // CUT AND NEGATION
  {
    id: 15,
    section: "semantics",
    type: "concept",
    title: "Cut (!) and Negation",
    content: {
      description: "Control operators that break pure logic:",
      items: [
        { icon: "✂️", text: "Cut (!)", detail: "Commit to current choice, no backtracking" },
        { icon: "🚫", text: "Negation (\\+)", detail: "Negation as failure - succeeds if goal fails" },
        { icon: "⚠️", text: "Non-logical", detail: "These break declarative semantics" }
      ],
      code: `% Cut prevents backtracking
max(X, Y, X) :- X >= Y, !.
max(X, Y, Y).

% Negation as failure
not_member(X, L) :- \\+ member(X, L).`
    }
  },

  // COMPARISON TO OTHER PARADIGMS
  {
    id: 16,
    section: "comparison",
    type: "comparison",
    title: "Logic vs Other Paradigms",
    content: {
      approaches: [
        {
          name: "Imperative",
          characteristics: [
            "Explicit step-by-step instructions",
            "Mutable state",
            "Control flow statements",
            "You specify HOW"
          ]
        },
        {
          name: "Logic",
          characteristics: [
            "Declare facts and rules",
            "No mutable state",
            "Search and backtracking",
            "You specify WHAT"
          ]
        }
      ]
    }
  },

  // ADVANTAGES
  {
    id: 17,
    section: "perspective",
    type: "concept",
    title: "Advantages of Logic Programming",
    content: {
      description: "When logic programming shines:",
      items: [
        { icon: "🧠", text: "Natural for Some Problems", detail: "Databases, expert systems, NLP" },
        { icon: "✨", text: "Concise", detail: "What takes 100 lines in C may be 5 in Prolog" },
        { icon: "🔄", text: "Bidirectional", detail: "Same relation works forward and backward" },
        { icon: "🔍", text: "Built-in Search", detail: "Backtracking is automatic" }
      ]
    }
  },

  // CHALLENGES
  {
    id: 18,
    section: "perspective",
    type: "concept",
    title: "Challenges of Logic Programming",
    content: {
      description: "Difficulties with the logic approach:",
      items: [
        { icon: "🐢", text: "Performance", detail: "Search can be slow" },
        { icon: "♾️", text: "Termination", detail: "Easy to write infinite loops" },
        { icon: "🧠", text: "Different Thinking", detail: "Requires new mental model" },
        { icon: "🔢", text: "Arithmetic", detail: "Awkward handling of math" },
        { icon: "📤", text: "I/O", detail: "Side effects don't fit model" }
      ]
    }
  },

  // APPLICATIONS
  {
    id: 19,
    section: "perspective",
    type: "concept",
    title: "Applications of Logic Programming",
    content: {
      description: "Where Prolog and logic programming are used:",
      items: [
        { icon: "🤖", text: "Expert Systems", detail: "Encode domain knowledge as rules" },
        { icon: "🗣️", text: "Natural Language", detail: "Grammar rules, parsing" },
        { icon: "🗄️", text: "Databases", detail: "Query languages (SQL is related)" },
        { icon: "✓", text: "Theorem Proving", detail: "Automated reasoning" },
        { icon: "🧬", text: "Symbolic AI", detail: "Knowledge representation" }
      ]
    }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 12 Summary",
    content: {
      sections: [
        {
          title: "Core Concepts",
          points: [
            "Predicates declare relationships",
            "Horn clauses: facts, rules, queries",
            "Describe WHAT, not HOW"
          ]
        },
        {
          title: "Prolog Execution",
          points: [
            "Unification matches patterns",
            "Resolution proves goals",
            "Backtracking finds all solutions"
          ]
        },
        {
          title: "Practical Issues",
          points: [
            "Order of clauses matters",
            "Cut and negation break purity",
            "Good for symbolic AI, NLP"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Horn Clauses Demo
const HornClausesDemo = () => {
  const [selected, setSelected] = useState('fact');

  const clauses = {
    fact: {
      type: 'Fact',
      code: 'parent(tom, mary).',
      meaning: 'Tom is the parent of Mary.',
      structure: 'Head only - no body, no conditions'
    },
    rule: {
      type: 'Rule',
      code: 'grandparent(X, Z) :- parent(X, Y), parent(Y, Z).',
      meaning: 'X is grandparent of Z if X is parent of Y AND Y is parent of Z.',
      structure: 'Head :- Body (head if body)'
    },
    query: {
      type: 'Query',
      code: '?- grandparent(tom, X).',
      meaning: 'Who is Tom the grandparent of?',
      structure: 'Body only - what we want to prove'
    }
  };

  const current = clauses[selected];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: Horn Clauses</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        {Object.entries(clauses).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-5 py-2 rounded-lg text-lg ${selected === key ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}
          >
            {c.type}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <div className="text-green-400 font-mono text-2xl text-center">{current.code}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Meaning</div>
          <div className="text-white text-lg">{current.meaning}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Structure</div>
          <div className="text-blue-400 text-lg">{current.structure}</div>
        </div>
      </div>
    </div>
  );
};

// Unification Demo
const UnificationDemo = () => {
  const [example, setExample] = useState(0);

  const examples = [
    { left: 'X', right: '5', result: 'X = 5', success: true, explanation: 'Variable unifies with constant' },
    { left: 'foo(X, b)', right: 'foo(a, Y)', result: 'X = a, Y = b', success: true, explanation: 'Variables bound to make structures match' },
    { left: 'foo(X, X)', right: 'foo(a, b)', result: 'fails', success: false, explanation: 'X cannot be both a and b' },
    { left: '[H|T]', right: '[1,2,3]', result: 'H = 1, T = [2,3]', success: true, explanation: 'List pattern matching' },
    { left: 'f(g(X))', right: 'f(Y)', result: 'Y = g(X)', success: true, explanation: 'Nested structure unification' }
  ];

  const current = examples[example];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: Unification</div>
      
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {examples.map((_, i) => (
          <button
            key={i}
            onClick={() => setExample(i)}
            className={`w-10 h-10 rounded-lg ${example === i ? 'bg-blue-500' : 'bg-slate-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <div className="flex items-center justify-center gap-4 text-xl font-mono">
          <span className="text-amber-400">{current.left}</span>
          <span className="text-slate-400">=</span>
          <span className="text-green-400">{current.right}</span>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${current.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
        <div className={`text-2xl font-bold ${current.success ? 'text-green-400' : 'text-red-400'}`}>
          {current.success ? '✓ ' : '✗ '}{current.result}
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <div className="text-slate-300 text-lg">{current.explanation}</div>
      </div>
    </div>
  );
};

// Resolution Demo
const ResolutionDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { 
      goal: '?- grandparent(tom, X)', 
      action: 'Start with query',
      bindings: {},
      status: 'searching'
    },
    { 
      goal: 'grandparent(tom, X)', 
      action: 'Find rule: grandparent(A,C) :- parent(A,B), parent(B,C)',
      bindings: { A: 'tom', C: 'X' },
      status: 'matched'
    },
    { 
      goal: 'parent(tom, B), parent(B, X)', 
      action: 'Replace goal with body',
      bindings: { A: 'tom', C: 'X' },
      status: 'searching'
    },
    { 
      goal: 'parent(tom, B)', 
      action: 'Try first subgoal, find: parent(tom, mary)',
      bindings: { A: 'tom', B: 'mary', C: 'X' },
      status: 'matched'
    },
    { 
      goal: 'parent(mary, X)', 
      action: 'Continue with second subgoal, find: parent(mary, ann)',
      bindings: { A: 'tom', B: 'mary', C: 'ann', X: 'ann' },
      status: 'matched'
    },
    { 
      goal: '', 
      action: 'All goals satisfied!',
      bindings: { X: 'ann' },
      status: 'success'
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: Resolution</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-base mb-2">Current Goal(s):</div>
        <div className="text-green-400 font-mono text-xl">
          {current.goal || '(empty - done!)'}
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${
        current.status === 'success' ? 'bg-green-500/20' : 
        current.status === 'matched' ? 'bg-blue-500/20' : 'bg-slate-900'
      }`}>
        <div className="text-white text-lg">{current.action}</div>
      </div>

      {Object.keys(current.bindings).length > 0 && (
        <div className="bg-slate-900 p-4 rounded-lg mb-4">
          <div className="text-slate-400 text-base mb-2">Variable Bindings:</div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(current.bindings).map(([k, v]) => (
              <span key={k} className="px-3 py-1 bg-blue-500/30 rounded font-mono">
                {k} = {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Backtracking Demo
const BacktrackingDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { current: 'parent(tom, X)', tried: [], found: 'mary', next: 'Try first match' },
    { current: 'parent(tom, X)', tried: ['mary'], found: 'john', next: 'Backtrack, try next' },
    { current: 'parent(tom, X)', tried: ['mary', 'john'], found: null, next: 'No more matches' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: Backtracking</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-base mb-2">Query:</div>
        <div className="text-green-400 font-mono text-xl">?- {current.current}</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-900 p-3 rounded-lg text-center">
          <div className="text-slate-400 text-sm">Database</div>
          <div className="font-mono text-base">
            <div className={current.found === 'mary' || current.tried.includes('mary') ? 'text-green-400' : 'text-slate-500'}>parent(tom, mary)</div>
            <div className={current.found === 'john' || current.tried.includes('john') ? 'text-green-400' : 'text-slate-500'}>parent(tom, john)</div>
            <div className="text-slate-500">parent(mary, ann)</div>
          </div>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center">
          <div className="text-slate-400 text-sm">Already Found</div>
          <div className="text-amber-400 font-mono text-lg">
            {current.tried.length > 0 ? current.tried.join(', ') : '(none)'}
          </div>
        </div>

        <div className={`p-3 rounded-lg text-center ${current.found ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className="text-slate-400 text-sm">Current Match</div>
          <div className={`font-mono text-xl ${current.found ? 'text-green-400' : 'text-red-400'}`}>
            {current.found ? `X = ${current.found}` : 'no more'}
          </div>
        </div>
      </div>

      <div className="bg-blue-500/20 p-4 rounded-lg mb-4 text-center">
        <div className="text-blue-400 text-lg">{current.next}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50">Next → (;)</button>
      </div>
    </div>
  );
};

// Family Tree Demo
const FamilyTreeDemo = () => {
  const [query, setQuery] = useState('parent(tom, X)');

  const database = `parent(tom, mary).
parent(tom, john).
parent(mary, ann).
parent(john, jim).`;

  const results = {
    'parent(tom, X)': ['X = mary', 'X = john'],
    'grandparent(tom, X)': ['X = ann', 'X = jim'],
    'ancestor(tom, ann)': ['yes'],
    'sibling(mary, X)': ['X = john']
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: Family Database</div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Database:</div>
          <pre className="text-green-400 font-mono text-sm">{database}</pre>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Family Tree:</div>
          <div className="text-center font-mono">
            <div className="text-amber-400 text-xl">tom</div>
            <div className="text-slate-500">↙ ↘</div>
            <div className="flex justify-center gap-8">
              <div className="text-blue-400">mary</div>
              <div className="text-blue-400">john</div>
            </div>
            <div className="flex justify-center gap-12">
              <div className="text-slate-500">↓</div>
              <div className="text-slate-500">↓</div>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-green-400">ann</div>
              <div className="text-green-400">jim</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {Object.keys(results).map(q => (
          <button
            key={q}
            onClick={() => setQuery(q)}
            className={`px-3 py-2 rounded font-mono text-sm ${query === q ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}
          >
            ?- {q}
          </button>
        ))}
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg">
        <div className="text-slate-400 text-sm mb-2">Results:</div>
        <div className="text-green-400 font-mono text-xl">
          {results[query]?.join(' ; ') || 'no'}
        </div>
      </div>
    </div>
  );
};

// Lists Demo
const ListsDemo = () => {
  const [op, setOp] = useState('member');

  const ops = {
    member: {
      code: '?- member(2, [1,2,3]).',
      result: 'yes',
      trace: 'Check: 2 = 1? No. Check: 2 in [2,3]? 2 = 2? Yes!'
    },
    append: {
      code: '?- append([1,2], [3,4], X).',
      result: 'X = [1,2,3,4]',
      trace: 'Recursive: [1|append([2],[3,4])] → [1,2|append([],[3,4])] → [1,2,3,4]'
    },
    split: {
      code: '?- [H|T] = [a,b,c].',
      result: 'H = a, T = [b,c]',
      trace: 'Pattern match: Head = first element, Tail = rest'
    },
    length: {
      code: '?- length([a,b,c], N).',
      result: 'N = 3',
      trace: 'Recursive count: 1 + length([b,c]) = 1 + 1 + length([c]) = 3'
    }
  };

  const current = ops[op];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-blue-400 text-lg mb-4 font-mono">Interactive: List Operations</div>
      
      <div className="flex gap-2 mb-4 justify-center">
        {Object.keys(ops).map(o => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`px-4 py-2 rounded capitalize ${op === o ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-green-400 font-mono text-xl">{current.code}</div>
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg mb-4">
        <div className="text-green-400 font-mono text-xl font-bold">{current.result}</div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <div className="text-slate-400 text-sm mb-1">How it works:</div>
        <div className="text-slate-300 text-base">{current.trace}</div>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🔮</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-blue-400 mb-10">{slide.content.subtitle}</h2>}
    <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-3xl">
      {slide.content.topics?.map((t, i) => (
        <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-lg">{t}</span>
      ))}
    </div>
  </div>
);

const ConceptSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-3xl text-slate-300 mb-8">{slide.content.description}</p>}
    {slide.content.items && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slide.content.items.map((item, i) => (
          <div key={i} className="bg-slate-800/50 p-6 rounded-xl flex items-start gap-4">
            {item.icon && <span className="text-5xl">{item.icon}</span>}
            <div>
              <p className="text-white font-semibold text-2xl">{item.text}</p>
              {item.detail && <p className="text-slate-300 text-xl mt-2">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    )}
    {slide.content.code && (
      <div className="mt-6 bg-slate-900 p-5 rounded-lg">
        <pre className="text-green-400 font-mono text-lg whitespace-pre-wrap">{slide.content.code}</pre>
      </div>
    )}
    {slide.content.note && <p className="mt-6 text-blue-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'horn-clauses' && <HornClausesDemo />}
    {slide.interactive?.type === 'unification' && <UnificationDemo />}
    {slide.interactive?.type === 'resolution' && <ResolutionDemo />}
    {slide.interactive?.type === 'backtracking' && <BacktrackingDemo />}
    {slide.interactive?.type === 'family-tree' && <FamilyTreeDemo />}
    {slide.interactive?.type === 'lists' && <ListsDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-amber-500 bg-amber-500/10' : 'border-blue-500 bg-blue-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-amber-400' : 'text-blue-400'}`}>{a.name}</h3>
          {a.characteristics && (
            <ul className="space-y-2">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-xl">• {c}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-blue-400 font-bold text-2xl mb-5">{section.title}</h3>
          <ul className="space-y-3">
            {section.points.map((point, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-xl">✓</span>
                <span className="text-slate-300 text-xl">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// SLIDE RENDERER
// ============================================================================
const SlideRenderer = ({ slide }) => {
  switch (slide.type) {
    case 'title': return <TitleSlide slide={slide} />;
    case 'concept': return <ConceptSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter12Slides({ onBackToChapters }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const sections = [...new Set(SLIDES.map(s => s.section))];
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setCurrentSlide(s => Math.max(s - 1, 0));
    } else if (e.key === 'Escape') {
      setShowMenu(false);
    } else if (e.key === 'm') {
      setShowMenu(m => !m);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm z-40 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-700 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-blue-400 font-bold text-lg">Ch 12: Logic Languages</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{currentSlide + 1} / {SLIDES.length}</span>
            <button
              type="button"
              onClick={onBackToChapters}
              aria-label="Back to chapters"
              title="Back to chapters"
              className="p-1.5 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 hover:bg-slate-700/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm">{slide.section}</span>
          </div>
        </div>
      </header>

      {/* Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 p-4 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Chapter 12 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-blue-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-blue-500 text-white' : 'hover:bg-slate-700'
                    }`}>
                    <span className="text-xs opacity-60 mr-2">{s.id}</span>{s.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="pt-14 pb-20 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <SlideRenderer slide={slide} />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))} disabled={currentSlide === 0}
            className="flex items-center gap-2 px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-30">
            ← Previous
          </button>
          <div className="flex-1 mx-8">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 rounded text-lg disabled:opacity-30">
            Next →
          </button>
        </div>
        <div className="text-center text-slate-500 text-sm pb-2">
          <kbd className="px-2 py-1 bg-slate-700 rounded">←</kbd> <kbd className="px-2 py-1 bg-slate-700 rounded">→</kbd> navigate • <kbd className="px-2 py-1 bg-slate-700 rounded">M</kbd> menu
        </div>
      </footer>
    </div>
  );
}

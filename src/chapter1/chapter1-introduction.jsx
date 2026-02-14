import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 1: INTRODUCTION
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 1,
  title: "Introduction",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#f97316" // orange
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
    title: "Chapter 1: Introduction",
    content: {
      subtitle: "Why Study Programming Languages?",
      topics: [
        "Language Categories",
        "Compilation vs Interpretation",
        "Phases of Compilation",
        "Lexical Analysis",
        "Parsing",
        "Semantic Analysis"
      ]
    }
  },

  // LANGUAGE LEVELS
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Programming Language Levels",
    content: {
      description: "Three categories of programming languages:",
      items: [
        { icon: "🔢", text: "Machine Languages", detail: "Binary code - the ONLY language CPUs understand directly" },
        { icon: "📝", text: "Assembly Languages", detail: "Low-level symbolic representation (mov, add, jmp)" },
        { icon: "🚀", text: "High-Level Languages", detail: "Abstracted from hardware (C, Java, Python, etc.)" }
      ]
    },
    interactive: { type: "language-levels" }
  },

  // WHY STUDY PL
  {
    id: 3,
    section: "intro",
    type: "concept",
    title: "Why Study Programming Languages?",
    content: {
      description: "Understanding languages makes you a better programmer:",
      items: [
        { icon: "🎯", text: "Choose the Right Tool", detail: "C for systems, Python for ML, JavaScript for web" },
        { icon: "📚", text: "Learn New Languages Faster", detail: "Concepts transfer between languages" },
        { icon: "🔧", text: "Use Languages Better", detail: "Understand obscure features and implementation costs" },
        { icon: "💡", text: "Simulate Missing Features", detail: "Implement recursion, OOP, etc. in languages that lack them" }
      ]
    }
  },

  // WHAT MAKES A LANGUAGE SUCCESSFUL
  {
    id: 4,
    section: "intro",
    type: "concept",
    title: "What Makes a Language Successful?",
    content: {
      description: "Factors that contribute to language adoption:",
      items: [
        { icon: "📖", text: "Easy to Learn", detail: "Python, BASIC, Pascal, Go" },
        { icon: "💪", text: "Expressive Power", detail: "C, Lisp, Perl - powerful once fluent" },
        { icon: "⚡", text: "Fast Execution", detail: "C, C++, Fortran, Rust - compile to efficient code" },
        { icon: "🏢", text: "Corporate Backing", detail: "Java (Oracle), C# (Microsoft), Swift (Apple), Go (Google)" },
        { icon: "🆓", text: "Free & Accessible", detail: "Python, JavaScript, Java - widely available" }
      ]
    }
  },

  // LANGUAGE CLASSIFICATION
  {
    id: 5,
    section: "paradigms",
    type: "concept",
    title: "Programming Paradigms",
    content: {
      description: "Languages grouped by computational model:",
      items: [
        { icon: "📋", text: "Imperative - von Neumann", detail: "Fortran, C, Pascal, Basic" },
        { icon: "🎭", text: "Imperative - Object-Oriented", detail: "Smalltalk, C++, Java, Python" },
        { icon: "📜", text: "Imperative - Scripting", detail: "Perl, Python, JavaScript, PHP, Ruby" },
        { icon: "λ", text: "Declarative - Functional", detail: "Scheme, ML, Haskell, Lisp" },
        { icon: "🔮", text: "Declarative - Logic", detail: "Prolog, Datalog" }
      ]
    },
    interactive: { type: "paradigm-explorer" }
  },

  // COMPILATION VS INTERPRETATION
  {
    id: 6,
    section: "compilation",
    type: "comparison",
    title: "Compilation vs Interpretation",
    content: {
      approaches: [
        {
          name: "Compilation",
          characteristics: [
            "Translate entire program before execution",
            "Compiler goes away after translation",
            "Better performance (optimizations)",
            "Less flexibility at runtime"
          ],
          examples: "C, C++, Rust, Go"
        },
        {
          name: "Interpretation",
          characteristics: [
            "Execute program directly, line by line",
            "Interpreter stays during execution",
            "Greater flexibility",
            "Better error messages"
          ],
          examples: "Python, JavaScript, Ruby"
        }
      ]
    }
  },

  // COMPILATION PIPELINE
  {
    id: 7,
    section: "compilation",
    type: "concept",
    title: "The Compilation Pipeline",
    content: {
      description: "Source code → Executable through multiple stages:",
      items: [
        { icon: "📄", text: "Source Program", detail: "Human-readable code (e.g., .c, .java)" },
        { icon: "⚙️", text: "Compiler", detail: "Translates to target language" },
        { icon: "🔗", text: "Linker", detail: "Combines with libraries" },
        { icon: "💾", text: "Executable", detail: "Machine code ready to run" }
      ]
    },
    interactive: { type: "compilation-pipeline" }
  },

  // HYBRID APPROACHES
  {
    id: 8,
    section: "compilation",
    type: "concept",
    title: "Hybrid Approaches",
    content: {
      description: "Most modern implementations mix compilation and interpretation:",
      items: [
        { icon: "☕", text: "Java", detail: "Compile to bytecode → JVM interprets/JIT compiles" },
        { icon: "🔷", text: "C#/.NET", detail: "Compile to CIL → CLR JIT compiles" },
        { icon: "🐍", text: "Python", detail: "Compile to bytecode → Python VM interprets" },
        { icon: "🌐", text: "JavaScript", detail: "JIT compilation in modern engines (V8, SpiderMonkey)" }
      ]
    }
  },

  // JIT COMPILATION
  {
    id: 9,
    section: "compilation",
    type: "concept",
    title: "Just-In-Time (JIT) Compilation",
    content: {
      description: "Compile at runtime for the best of both worlds:",
      items: [
        { icon: "⏱️", text: "Delayed Compilation", detail: "Wait until code is actually needed" },
        { icon: "🔥", text: "Hot Spot Optimization", detail: "Optimize frequently executed code paths" },
        { icon: "📊", text: "Profile-Guided", detail: "Use runtime info to make better decisions" },
        { icon: "🎯", text: "Speculative", detail: "Assume types, deoptimize if wrong" }
      ]
    }
  },

  // PHASES OF COMPILATION OVERVIEW
  {
    id: 10,
    section: "phases",
    type: "concept",
    title: "Phases of Compilation",
    content: {
      description: "A compiler works in distinct phases:",
      items: [
        { icon: "1️⃣", text: "Lexical Analysis (Scanning)", detail: "Characters → Tokens" },
        { icon: "2️⃣", text: "Syntax Analysis (Parsing)", detail: "Tokens → Parse Tree" },
        { icon: "3️⃣", text: "Semantic Analysis", detail: "Check types, resolve names" },
        { icon: "4️⃣", text: "Intermediate Code Gen", detail: "Parse Tree → IR" },
        { icon: "5️⃣", text: "Optimization", detail: "Improve IR" },
        { icon: "6️⃣", text: "Code Generation", detail: "IR → Target Code" }
      ]
    },
    interactive: { type: "compiler-phases" }
  },

  // LEXICAL ANALYSIS
  {
    id: 11,
    section: "phases",
    type: "concept",
    title: "Lexical Analysis (Scanning)",
    content: {
      description: "Break source code into tokens - the smallest meaningful units:",
      items: [
        { icon: "🔤", text: "Keywords", detail: "if, while, for, return, class" },
        { icon: "📛", text: "Identifiers", detail: "Variable and function names" },
        { icon: "🔢", text: "Literals", detail: "Numbers, strings, characters" },
        { icon: "➕", text: "Operators", detail: "+, -, *, /, ==, &&" },
        { icon: "🔣", text: "Punctuation", detail: "( ) { } [ ] ; ," }
      ],
      note: "Implemented using DFAs (Deterministic Finite Automata)"
    },
    interactive: { type: "tokenizer" }
  },

  // PARSING
  {
    id: 12,
    section: "phases",
    type: "concept",
    title: "Syntax Analysis (Parsing)",
    content: {
      description: "Organize tokens into a hierarchical structure:",
      items: [
        { icon: "📐", text: "Context-Free Grammar", detail: "Rules defining valid syntax" },
        { icon: "🌳", text: "Parse Tree", detail: "Full derivation structure" },
        { icon: "🌲", text: "Abstract Syntax Tree", detail: "Simplified tree (no punctuation)" },
        { icon: "❌", text: "Syntax Errors", detail: "Report invalid structure" }
      ],
      note: "Implemented using PDAs (Pushdown Automata)"
    }
  },

  // CONTEXT-FREE GRAMMAR
  {
    id: 13,
    section: "phases",
    type: "concept",
    title: "Context-Free Grammars",
    content: {
      description: "Rules that define the structure of valid programs:",
      code: `// Example grammar for while loops
statement → while ( expression ) statement
statement → { statement-list }
statement → identifier = expression ;

expression → expression + term
expression → term
term → identifier | number`
    },
    interactive: { type: "grammar-demo" }
  },

  // SEMANTIC ANALYSIS
  {
    id: 14,
    section: "phases",
    type: "concept",
    title: "Semantic Analysis",
    content: {
      description: "Discover and check the meaning of the program:",
      items: [
        { icon: "🏷️", text: "Type Checking", detail: "Ensure operations are type-compatible" },
        { icon: "🔍", text: "Name Resolution", detail: "Link identifiers to declarations" },
        { icon: "📊", text: "Symbol Table", detail: "Track all identifiers and their attributes" },
        { icon: "⚠️", text: "Static vs Dynamic", detail: "Compile-time vs runtime checks" }
      ]
    }
  },

  // SYMBOL TABLE
  {
    id: 15,
    section: "phases",
    type: "concept",
    title: "The Symbol Table",
    content: {
      description: "Central data structure tracking all program identifiers:",
      items: [
        { icon: "📛", text: "Name", detail: "The identifier string" },
        { icon: "🏷️", text: "Type", detail: "int, float, function, class, etc." },
        { icon: "📍", text: "Scope", detail: "Where the identifier is visible" },
        { icon: "💾", text: "Location", detail: "Memory address or register" },
        { icon: "📏", text: "Size", detail: "How much memory it needs" }
      ]
    },
    interactive: { type: "symbol-table" }
  },

  // INTERMEDIATE REPRESENTATION
  {
    id: 16,
    section: "phases",
    type: "concept",
    title: "Intermediate Representation (IR)",
    content: {
      description: "Machine-independent code between front and back end:",
      items: [
        { icon: "🌳", text: "Tree-based IR", detail: "AST or DAG" },
        { icon: "📝", text: "Three-Address Code", detail: "x = y op z format" },
        { icon: "📚", text: "Stack Machine Code", detail: "Like Java bytecode" },
        { icon: "🔗", text: "SSA Form", detail: "Static Single Assignment" }
      ],
      note: "Allows same front-end for multiple targets, same back-end for multiple languages"
    }
  },

  // CODE OPTIMIZATION
  {
    id: 17,
    section: "phases",
    type: "concept",
    title: "Code Optimization",
    content: {
      description: "Transform code to run faster or use less space:",
      items: [
        { icon: "🗑️", text: "Dead Code Elimination", detail: "Remove unreachable code" },
        { icon: "📦", text: "Constant Folding", detail: "Compute constants at compile time" },
        { icon: "🔄", text: "Loop Optimization", detail: "Unrolling, invariant motion" },
        { icon: "📍", text: "Register Allocation", detail: "Minimize memory access" },
        { icon: "📐", text: "Inlining", detail: "Replace function calls with body" }
      ]
    }
  },

  // CODE GENERATION
  {
    id: 18,
    section: "phases",
    type: "concept",
    title: "Code Generation",
    content: {
      description: "Translate IR to target machine code:",
      items: [
        { icon: "📝", text: "Instruction Selection", detail: "Choose machine instructions for IR ops" },
        { icon: "📊", text: "Register Allocation", detail: "Assign variables to registers" },
        { icon: "📍", text: "Instruction Scheduling", detail: "Order instructions for pipeline efficiency" },
        { icon: "💾", text: "Memory Layout", detail: "Assign addresses to data" }
      ]
    }
  },

  // GCD EXAMPLE
  {
    id: 19,
    section: "example",
    type: "concept",
    title: "Example: GCD Program",
    content: {
      description: "Let's trace a simple program through compilation:",
      code: `int main() {
    int i = getint(), j = getint();
    while (i != j) {
        if (i > j) i = i - j;
        else j = j - i;
    }
    putint(i);
}`
    },
    interactive: { type: "gcd-compilation" }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 1 Summary",
    content: {
      sections: [
        {
          title: "Language Concepts",
          points: [
            "Machine → Assembly → High-level",
            "Imperative vs Declarative paradigms",
            "Compilation vs Interpretation"
          ]
        },
        {
          title: "Compilation Phases",
          points: [
            "Lexical: chars → tokens (DFA)",
            "Syntax: tokens → tree (CFG)",
            "Semantic: type check, resolve names"
          ]
        },
        {
          title: "Back End",
          points: [
            "Intermediate representation (IR)",
            "Optimization transforms",
            "Target code generation"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Language Levels Demo
const LanguageLevelsDemo = () => {
  const [selected, setSelected] = useState('high');

  const levels = {
    high: {
      name: 'High-Level (C)',
      code: 'int sum = a + b;',
      desc: 'Human readable, portable, abstracted from hardware'
    },
    asm: {
      name: 'Assembly (x86)',
      code: `mov eax, [a]
add eax, [b]
mov [sum], eax`,
      desc: 'Symbolic, 1-to-1 with machine code, architecture-specific'
    },
    machine: {
      name: 'Machine Code',
      code: `8B 45 FC
03 45 F8
89 45 F4`,
      desc: 'Binary/hex, directly executed by CPU, not human readable'
    }
  };

  const current = levels[selected];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Language Levels</div>
      
      <div className="flex gap-3 mb-4 justify-center">
        {Object.entries(levels).map(([key, level]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-4 py-2 rounded-lg text-lg ${selected === key ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}
          >
            {key === 'high' ? 'High-Level' : key === 'asm' ? 'Assembly' : 'Machine'}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <div className="text-orange-400 font-bold mb-2">{current.name}</div>
        <pre className="text-green-400 font-mono text-xl">{current.code}</pre>
      </div>

      <div className="bg-orange-500/20 p-4 rounded-lg">
        <div className="text-slate-300">{current.desc}</div>
      </div>

      <div className="mt-4 flex justify-center items-center gap-4">
        <div className={`px-4 py-2 rounded ${selected === 'high' ? 'bg-orange-500' : 'bg-slate-700'}`}>High</div>
        <span className="text-slate-500">→</span>
        <div className={`px-4 py-2 rounded ${selected === 'asm' ? 'bg-orange-500' : 'bg-slate-700'}`}>Assembly</div>
        <span className="text-slate-500">→</span>
        <div className={`px-4 py-2 rounded ${selected === 'machine' ? 'bg-orange-500' : 'bg-slate-700'}`}>Machine</div>
      </div>
    </div>
  );
};

// Paradigm Explorer
const ParadigmExplorer = () => {
  const [paradigm, setParadigm] = useState('imperative');

  const paradigms = {
    imperative: {
      name: 'Imperative',
      desc: 'Describe HOW to compute step by step',
      code: `// Sum of 1 to n
int sum = 0;
for (int i = 1; i <= n; i++) {
    sum = sum + i;
}`,
      langs: ['C', 'Java', 'Python', 'JavaScript']
    },
    functional: {
      name: 'Functional',
      desc: 'Describe WHAT to compute using functions',
      code: `-- Sum of 1 to n
sum [1..n]
-- or
foldr (+) 0 [1..n]`,
      langs: ['Haskell', 'Lisp', 'ML', 'Erlang']
    },
    logic: {
      name: 'Logic',
      desc: 'Describe WHAT is true, let system find solution',
      code: `% Sum of 1 to N
sum(0, 0).
sum(N, S) :- 
    N > 0,
    N1 is N - 1,
    sum(N1, S1),
    S is S1 + N.`,
      langs: ['Prolog', 'Datalog', 'Mercury']
    }
  };

  const current = paradigms[paradigm];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Programming Paradigms</div>
      
      <div className="flex gap-3 mb-4 justify-center">
        {Object.keys(paradigms).map(p => (
          <button
            key={p}
            onClick={() => setParadigm(p)}
            className={`px-5 py-2 rounded-lg text-lg capitalize ${paradigm === p ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-orange-400 font-bold text-xl mb-1">{current.name}</div>
        <div className="text-slate-400">{current.desc}</div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <pre className="text-green-400 font-mono text-base">{current.code}</pre>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {current.langs.map(lang => (
          <span key={lang} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">{lang}</span>
        ))}
      </div>
    </div>
  );
};

// Compilation Pipeline Demo
const CompilationPipelineDemo = () => {
  const [stage, setStage] = useState(0);

  const stages = [
    { name: 'Source', icon: '📄', file: 'program.c', desc: 'Human-readable source code' },
    { name: 'Preprocessor', icon: '⚙️', file: 'program.i', desc: 'Expand macros, includes' },
    { name: 'Compiler', icon: '🔧', file: 'program.s', desc: 'Translate to assembly' },
    { name: 'Assembler', icon: '🔨', file: 'program.o', desc: 'Translate to object code' },
    { name: 'Linker', icon: '🔗', file: 'program', desc: 'Combine with libraries' },
    { name: 'Executable', icon: '🚀', file: './program', desc: 'Ready to run!' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Compilation Pipeline</div>
      
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {stages.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => setStage(i)}
              className={`flex flex-col items-center p-3 rounded-lg ${stage === i ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs mt-1">{s.name}</span>
            </button>
            {i < stages.length - 1 && <span className="text-slate-500 text-xl">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="text-orange-400 font-bold text-xl">{stages[stage].name}</div>
        <div className="text-green-400 font-mono mt-2">{stages[stage].file}</div>
        <div className="text-slate-300 mt-2">{stages[stage].desc}</div>
      </div>

      <div className="flex gap-3 justify-center mt-4">
        <button onClick={() => setStage(s => Math.max(0, s - 1))} disabled={stage === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <button onClick={() => setStage(s => Math.min(stages.length - 1, s + 1))} 
          disabled={stage >= stages.length - 1}
          className="px-4 py-2 bg-orange-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Compiler Phases Demo
const CompilerPhasesDemo = () => {
  const [phase, setPhase] = useState(0);

  const phases = [
    { 
      name: 'Source Code',
      input: 'int x = 5 + 3;',
      output: null,
      desc: 'Original program text'
    },
    { 
      name: 'Lexical Analysis',
      input: 'int x = 5 + 3;',
      output: ['int', 'x', '=', '5', '+', '3', ';'],
      desc: 'Break into tokens'
    },
    { 
      name: 'Parsing',
      input: 'Tokens',
      output: 'AST: Decl(int, x, Add(5, 3))',
      desc: 'Build syntax tree'
    },
    { 
      name: 'Semantic Analysis',
      input: 'AST',
      output: 'Type-checked AST + Symbol Table',
      desc: 'Check types, resolve names'
    },
    { 
      name: 'IR Generation',
      input: 'Typed AST',
      output: 't1 = 5\nt2 = 3\nt3 = t1 + t2\nx = t3',
      desc: 'Generate intermediate code'
    },
    { 
      name: 'Code Generation',
      input: 'IR',
      output: 'mov eax, 5\nadd eax, 3\nmov [x], eax',
      desc: 'Generate target code'
    }
  ];

  const current = phases[phase];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Compiler Phases</div>
      
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => setPhase(i)}
            className={`px-3 py-2 rounded text-sm ${phase === i ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}
          >
            {i + 1}. {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-1">Input:</div>
          <div className="text-amber-400 font-mono">{current.input}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-1">Output:</div>
          <div className="text-green-400 font-mono text-sm">
            {Array.isArray(current.output) 
              ? current.output.map((t, i) => <span key={i} className="inline-block px-2 py-1 bg-green-500/20 rounded m-1">{t}</span>)
              : current.output || '—'}
          </div>
        </div>
      </div>

      <div className="bg-orange-500/20 p-4 rounded-lg">
        <div className="text-orange-400 font-bold">{current.name}</div>
        <div className="text-slate-300">{current.desc}</div>
      </div>
    </div>
  );
};

// Tokenizer Demo
const TokenizerDemo = () => {
  const [code, setCode] = useState('int x = 42;');

  const tokenize = (input) => {
    const tokens = [];
    const patterns = [
      { type: 'KEYWORD', regex: /^(int|float|if|else|while|return|void)\b/ },
      { type: 'IDENT', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'NUMBER', regex: /^[0-9]+/ },
      { type: 'OP', regex: /^[+\-*/=<>!&|]+/ },
      { type: 'PUNCT', regex: /^[;,(){}[\]]/ },
      { type: 'SPACE', regex: /^\s+/ }
    ];

    let remaining = input;
    while (remaining.length > 0) {
      let matched = false;
      for (const { type, regex } of patterns) {
        const match = remaining.match(regex);
        if (match) {
          if (type !== 'SPACE') {
            tokens.push({ type, value: match[0] });
          }
          remaining = remaining.slice(match[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        tokens.push({ type: 'ERROR', value: remaining[0] });
        remaining = remaining.slice(1);
      }
    }
    return tokens;
  };

  const tokens = tokenize(code);

  const typeColors = {
    KEYWORD: 'bg-purple-500/30 text-purple-400',
    IDENT: 'bg-blue-500/30 text-blue-400',
    NUMBER: 'bg-green-500/30 text-green-400',
    OP: 'bg-amber-500/30 text-amber-400',
    PUNCT: 'bg-slate-500/30 text-slate-400',
    ERROR: 'bg-red-500/30 text-red-400'
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Tokenizer (Lexical Analysis)</div>
      
      <div className="mb-4">
        <label className="text-slate-400 text-sm">Enter code:</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-slate-900 text-white p-3 rounded font-mono text-lg mt-1"
          placeholder="int x = 42;"
        />
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <div className="text-slate-400 text-sm mb-2">Tokens:</div>
        <div className="flex flex-wrap gap-2">
          {tokens.map((t, i) => (
            <div key={i} className={`px-3 py-2 rounded ${typeColors[t.type]}`}>
              <div className="font-mono text-lg">{t.value}</div>
              <div className="text-xs opacity-70">{t.type}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <button onClick={() => setCode('if (x > 0) return x;')} className="px-3 py-1 bg-slate-700 rounded text-sm">if statement</button>
        <button onClick={() => setCode('while (i < 10) i = i + 1;')} className="px-3 py-1 bg-slate-700 rounded text-sm">while loop</button>
        <button onClick={() => setCode('int sum(int a, int b) { return a + b; }')} className="px-3 py-1 bg-slate-700 rounded text-sm">function</button>
      </div>
    </div>
  );
};

// Grammar Demo
const GrammarDemo = () => {
  const [expanded, setExpanded] = useState(['stmt']);

  const grammar = {
    stmt: ['while ( expr ) stmt', '{ stmt-list }', 'id = expr ;'],
    expr: ['expr + term', 'expr - term', 'term'],
    term: ['term * factor', 'term / factor', 'factor'],
    factor: ['( expr )', 'id', 'num']
  };

  const toggleExpand = (nt) => {
    setExpanded(e => e.includes(nt) ? e.filter(x => x !== nt) : [...e, nt]);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Context-Free Grammar</div>
      
      <div className="space-y-3">
        {Object.entries(grammar).map(([nt, prods]) => (
          <div key={nt} className="bg-slate-900 p-4 rounded-lg">
            <button 
              onClick={() => toggleExpand(nt)}
              className="flex items-center gap-2 text-left w-full"
            >
              <span className={`transform transition-transform ${expanded.includes(nt) ? 'rotate-90' : ''}`}>▶</span>
              <span className="text-purple-400 font-mono font-bold">{nt}</span>
              <span className="text-slate-500">→</span>
            </button>
            {expanded.includes(nt) && (
              <div className="mt-2 ml-6 space-y-1">
                {prods.map((prod, i) => (
                  <div key={i} className="text-green-400 font-mono">
                    {i > 0 && <span className="text-slate-500 mr-2">|</span>}
                    {prod}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-orange-500/20 p-4 rounded-lg">
        <div className="text-slate-300 text-sm">
          <strong>Non-terminals</strong> (purple): Can be expanded using rules<br/>
          <strong>Terminals</strong>: Actual tokens (id, num, +, -, etc.)
        </div>
      </div>
    </div>
  );
};

// Symbol Table Demo
const SymbolTableDemo = () => {
  const [symbols] = useState([
    { name: 'main', type: 'function', scope: 'global', size: '—' },
    { name: 'i', type: 'int', scope: 'main', size: '4 bytes' },
    { name: 'j', type: 'int', scope: 'main', size: '4 bytes' },
    { name: 'getint', type: 'function', scope: 'global', size: '—' },
    { name: 'putint', type: 'function', scope: 'global', size: '—' }
  ]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: Symbol Table</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-sm mb-2">Source code:</div>
        <pre className="text-green-400 font-mono text-sm">{`int main() {
    int i = getint();
    int j = getint();
    ...
}`}</pre>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Scope</th>
            <th className="p-2 text-left">Size</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s, i) => (
            <tr key={i} className="border-t border-slate-700">
              <td className="p-2 text-purple-400 font-mono">{s.name}</td>
              <td className="p-2 text-amber-400">{s.type}</td>
              <td className="p-2 text-blue-400">{s.scope}</td>
              <td className="p-2 text-slate-400">{s.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// GCD Compilation Demo
const GCDCompilationDemo = () => {
  const [view, setView] = useState('source');

  const views = {
    source: {
      title: 'Source Code',
      content: `int main() {
    int i = getint(), j = getint();
    while (i != j) {
        if (i > j) i = i - j;
        else j = j - i;
    }
    putint(i);
}`
    },
    tokens: {
      title: 'Tokens',
      content: `int  main  (  )  {
int  i  =  getint  (  )  ,  j  =  getint  (  )  ;
while  (  i  !=  j  )  {
if  (  i  >  j  )  i  =  i  -  j  ;
else  j  =  j  -  i  ;
}
putint  (  i  )  ;
}`
    },
    ast: {
      title: 'Abstract Syntax Tree',
      content: `Program
└─ Function: main
   └─ Block
      ├─ Decl: i = Call(getint)
      ├─ Decl: j = Call(getint)
      ├─ While: (i != j)
      │  └─ If: (i > j)
      │     ├─ Assign: i = i - j
      │     └─ Assign: j = j - i
      └─ Call: putint(i)`
    },
    ir: {
      title: 'Intermediate Code',
      content: `entry:
  i = call getint
  j = call getint
loop:
  t1 = i != j
  if !t1 goto end
  t2 = i > j
  if !t2 goto else
  i = i - j
  goto loop
else:
  j = j - i
  goto loop
end:
  call putint, i`
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-orange-400 text-lg mb-4 font-mono">Interactive: GCD Compilation</div>
      
      <div className="flex gap-2 mb-4 justify-center">
        {Object.entries(views).map(([key, v]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded ${view === key ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}
          >
            {v.title}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="text-orange-400 font-bold mb-2">{views[view].title}</div>
        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{views[view].content}</pre>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">📚</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-orange-400 mb-10">{slide.content.subtitle}</h2>}
    <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-3xl">
      {slide.content.topics?.map((t, i) => (
        <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-lg">{t}</span>
      ))}
    </div>
  </div>
);

const ConceptSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>}
    {slide.content.items && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slide.content.items.map((item, i) => (
          <div key={i} className="bg-slate-800/50 p-5 rounded-xl flex items-start gap-4">
            {item.icon && <span className="text-4xl">{item.icon}</span>}
            <div>
              <p className="text-white font-semibold text-xl">{item.text}</p>
              {item.detail && <p className="text-slate-300 text-lg mt-1">{item.detail}</p>}
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
    {slide.content.note && <p className="mt-4 text-orange-400 italic text-lg">{slide.content.note}</p>}
    {slide.interactive?.type === 'language-levels' && <LanguageLevelsDemo />}
    {slide.interactive?.type === 'paradigm-explorer' && <ParadigmExplorer />}
    {slide.interactive?.type === 'compilation-pipeline' && <CompilationPipelineDemo />}
    {slide.interactive?.type === 'compiler-phases' && <CompilerPhasesDemo />}
    {slide.interactive?.type === 'tokenizer' && <TokenizerDemo />}
    {slide.interactive?.type === 'grammar-demo' && <GrammarDemo />}
    {slide.interactive?.type === 'symbol-table' && <SymbolTableDemo />}
    {slide.interactive?.type === 'gcd-compilation' && <GCDCompilationDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-green-400'}`}>{a.name}</h3>
          <ul className="space-y-2 mb-4">
            {a.characteristics.map((c, j) => (
              <li key={j} className="text-slate-300 text-lg">• {c}</li>
            ))}
          </ul>
          {a.examples && <p className="text-slate-500">Examples: {a.examples}</p>}
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
          <h3 className="text-orange-400 font-bold text-xl mb-4">{section.title}</h3>
          <ul className="space-y-2">
            {section.points.map((point, j) => (
              <li key={j} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-slate-300 text-lg">{point}</span>
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
export default function Chapter1Slides({ onBackToChapters }) {
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
            <span className="text-orange-400 font-bold text-lg">Ch 1: Introduction</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 1 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-orange-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-orange-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-orange-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-orange-600 rounded text-lg disabled:opacity-30">
            Next →
          </button>
        </div>
        <div className="text-center text-slate-500 text-sm pb-2">
          <kbd className="px-2 py-1 bg-slate-700 rounded">←</kbd> <kbd className="px-2 py-1 bg-slate-700 rounded">→</kbd> navigate • <kbd className="px-2 py-1 bg-slate-700 rounded">M</kbd> menu
          <p className="mt-1">&copy; {new Date().getFullYear()} Dr. Qi Li. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

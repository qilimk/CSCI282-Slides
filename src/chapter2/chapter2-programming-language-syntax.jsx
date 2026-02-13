import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 2: PROGRAMMING LANGUAGE SYNTAX (ENHANCED)
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// With detailed FIRST/FOLLOW and LR parsing table construction
// ============================================================================

const CHAPTER_CONFIG = {
  number: 2,
  title: "Programming Language Syntax",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#8b5cf6" // purple
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
    title: "Chapter 2: Programming Language Syntax",
    content: {
      subtitle: "From Characters to Parse Trees",
      topics: [
        "Regular Expressions & Scanning",
        "Context-Free Grammars",
        "FIRST and FOLLOW Sets",
        "LL(1) Parsing Tables",
        "LR Parsing & Table Construction",
        "Parse Trees & Derivations"
      ]
    }
  },

  // SCANNING OVERVIEW
  {
    id: 2,
    section: "scanning",
    type: "concept",
    title: "Scanning (Lexical Analysis)",
    content: {
      description: "Convert character stream to token stream:",
      items: [
        { icon: "🔤", text: "Tokenizing", detail: "Break source into tokens using DFA" },
        { icon: "📏", text: "Longest Match", detail: "foobar is one ID, not 'foo' + 'bar'" },
        { icon: "💬", text: "Remove Comments", detail: "Strip // and /* */ comments" },
        { icon: "📍", text: "Track Position", detail: "Line/column for error messages" }
      ]
    }
  },

  // CONTEXT-FREE GRAMMARS
  {
    id: 3,
    section: "cfg",
    type: "definition",
    title: "Context-Free Grammars (CFG)",
    content: {
      definition: "A CFG G = (T, N, S, P) where:",
      items: [
        { term: "T (Terminals)", definition: "Tokens from scanner", example: "id, num, +, *, (" },
        { term: "N (Non-terminals)", definition: "Grammar variables", example: "E, T, F, stmt" },
        { term: "S (Start Symbol)", definition: "Where derivation begins", example: "S or program" },
        { term: "P (Productions)", definition: "Rewrite rules A → α", example: "E → E + T | T" }
      ]
    }
  },

  // EXPRESSION GRAMMAR
  {
    id: 4,
    section: "cfg",
    type: "grammar",
    title: "Classic Expression Grammar",
    content: {
      title: "Grammar G1 (for FIRST/FOLLOW examples):",
      productions: [
        "E  → T E'",
        "E' → + T E' | ε",
        "T  → F T'",
        "T' → * F T' | ε",
        "F  → ( E ) | id"
      ],
      properties: [
        "Left recursion eliminated (E' and T' handle repetition)",
        "ε productions for optional parts",
        "Suitable for LL(1) parsing"
      ]
    }
  },

  // LL vs LR
  {
    id: 5,
    section: "parsing",
    type: "comparison",
    title: "LL vs LR Parsing",
    content: {
      approaches: [
        {
          name: "LL (Top-Down)",
          meaning: "Left-to-right, Leftmost derivation",
          how: "Predict which production to use",
          direction: "Build tree from root down",
          actions: ["Predict", "Match"],
          tools: "Recursive descent, ANTLR"
        },
        {
          name: "LR (Bottom-Up)",
          meaning: "Left-to-right, Rightmost derivation (reverse)",
          how: "Recognize handles and reduce",
          direction: "Build tree from leaves up",
          actions: ["Shift", "Reduce"],
          tools: "Yacc, Bison, most generators"
        }
      ],
      insight: "Every LL(1) grammar is LR(1), but not vice versa"
    }
  },

  // ===================== FIRST SET COMPUTATION =====================
  {
    id: 6,
    section: "first-follow",
    type: "concept",
    title: "Computing FIRST Sets",
    content: {
      description: "FIRST(α) = set of terminals that can begin strings derived from α",
      items: [
        { icon: "1️⃣", text: "If X is terminal", detail: "FIRST(X) = {X}" },
        { icon: "2️⃣", text: "If X → ε exists", detail: "Add ε to FIRST(X)" },
        { icon: "3️⃣", text: "If X → Y₁Y₂...Yₖ", detail: "Add FIRST(Y₁) to FIRST(X). If ε ∈ FIRST(Y₁), add FIRST(Y₂), etc." }
      ],
      note: "Repeat until no changes (fixed-point algorithm)"
    }
  },

  // FIRST SET ALGORITHM
  {
    id: 7,
    section: "first-follow",
    type: "algorithm",
    title: "FIRST Set Algorithm",
    content: {
      code: `Algorithm FIRST(X):
  if X is terminal:
    return {X}
  
  result = {}
  for each production X → Y₁Y₂...Yₖ:
    for i = 1 to k:
      result = result ∪ (FIRST(Yᵢ) - {ε})
      if ε ∉ FIRST(Yᵢ):
        break
      if i == k:  // all Yᵢ can derive ε
        result = result ∪ {ε}
  
  if X → ε exists:
    result = result ∪ {ε}
  
  return result`
    }
  },

  // FIRST SET INTERACTIVE
  {
    id: 8,
    section: "first-follow",
    type: "interactive",
    title: "FIRST Set Computation Demo",
    content: {
      description: "Step through computing FIRST sets for expression grammar:"
    },
    interactive: { type: "first-set-builder" }
  },

  // FOLLOW SET COMPUTATION
  {
    id: 9,
    section: "first-follow",
    type: "concept",
    title: "Computing FOLLOW Sets",
    content: {
      description: "FOLLOW(A) = set of terminals that can appear immediately after A",
      items: [
        { icon: "1️⃣", text: "Start symbol", detail: "Add $ (end marker) to FOLLOW(S)" },
        { icon: "2️⃣", text: "If A → αBβ", detail: "Add FIRST(β) - {ε} to FOLLOW(B)" },
        { icon: "3️⃣", text: "If A → αB or A → αBβ where ε ∈ FIRST(β)", detail: "Add FOLLOW(A) to FOLLOW(B)" }
      ],
      note: "Compute FIRST sets completely before computing FOLLOW"
    }
  },

  // FOLLOW SET ALGORITHM
  {
    id: 10,
    section: "first-follow",
    type: "algorithm",
    title: "FOLLOW Set Algorithm",
    content: {
      code: `Algorithm FOLLOW:
  FOLLOW(S) = {$}  // S is start symbol
  
  repeat until no changes:
    for each production A → α₁α₂...αₙ:
      for each non-terminal B in RHS:
        let β = symbols after B
        
        if β is not empty:
          FOLLOW(B) = FOLLOW(B) ∪ (FIRST(β) - {ε})
          
        if β is empty OR ε ∈ FIRST(β):
          FOLLOW(B) = FOLLOW(B) ∪ FOLLOW(A)`
    }
  },

  // FOLLOW SET INTERACTIVE
  {
    id: 11,
    section: "first-follow",
    type: "interactive",
    title: "FOLLOW Set Computation Demo",
    content: {
      description: "Step through computing FOLLOW sets:"
    },
    interactive: { type: "follow-set-builder" }
  },

  // ===================== LL(1) TABLE CONSTRUCTION =====================
  {
    id: 12,
    section: "ll-parsing",
    type: "concept",
    title: "LL(1) Parsing Table Construction",
    content: {
      description: "Build table M[A, a] telling which production to use:",
      items: [
        { icon: "1️⃣", text: "For each production A → α", detail: "For each a ∈ FIRST(α), add A → α to M[A, a]" },
        { icon: "2️⃣", text: "If ε ∈ FIRST(α)", detail: "For each b ∈ FOLLOW(A), add A → α to M[A, b]" },
        { icon: "⚠️", text: "Conflict check", detail: "If any cell has multiple entries, grammar is NOT LL(1)" }
      ]
    }
  },

  // LL(1) TABLE ALGORITHM
  {
    id: 13,
    section: "ll-parsing",
    type: "algorithm",
    title: "LL(1) Table Algorithm",
    content: {
      code: `Algorithm BuildLL1Table:
  for each production A → α:
    // Rule 1: Add to table for each terminal in FIRST(α)
    for each terminal a in FIRST(α):
      M[A, a] = A → α
    
    // Rule 2: If α can derive ε, add for FOLLOW(A)
    if ε ∈ FIRST(α):
      for each terminal b in FOLLOW(A):
        M[A, b] = A → α
      if $ ∈ FOLLOW(A):
        M[A, $] = A → α

LL(1) Condition:
  For any two productions A → α | β:
  1. FIRST(α) ∩ FIRST(β) = ∅
  2. At most one can derive ε
  3. If α ⟹* ε, then FIRST(β) ∩ FOLLOW(A) = ∅`
    }
  },

  // LL(1) TABLE INTERACTIVE
  {
    id: 14,
    section: "ll-parsing",
    type: "interactive",
    title: "LL(1) Table Construction Demo",
    content: {
      description: "Build the complete LL(1) parsing table step by step:"
    },
    interactive: { type: "ll1-table-builder" }
  },

  // LL PARSER SIMULATION
  {
    id: 15,
    section: "ll-parsing",
    type: "interactive",
    title: "LL(1) Parser in Action",
    content: {
      description: "Watch the parser use the table to parse 'id + id * id':"
    },
    interactive: { type: "ll-parser" }
  },

  // ===================== LR PARSING =====================
  {
    id: 16,
    section: "lr-parsing",
    type: "concept",
    title: "LR Parsing Overview",
    content: {
      description: "Bottom-up parsing using shift-reduce:",
      items: [
        { icon: "➡️", text: "Shift", detail: "Push next input token onto stack" },
        { icon: "⬅️", text: "Reduce", detail: "Replace RHS with LHS (reverse production)" },
        { icon: "✓", text: "Accept", detail: "Shift $ when only start symbol on stack" },
        { icon: "❌", text: "Error", detail: "No valid action in table" }
      ],
      note: "Stack holds states (numbers) interleaved with symbols"
    }
  },

  // LR ITEMS
  {
    id: 17,
    section: "lr-parsing",
    type: "concept",
    title: "LR(0) Items",
    content: {
      description: "An item shows how much of a production we've seen:",
      items: [
        { icon: "•", text: "Dot Position", detail: "A → α•β means we've seen α, expecting β" },
        { icon: "📍", text: "A → •XYZ", detail: "At start, haven't seen anything yet" },
        { icon: "📍", text: "A → X•YZ", detail: "Seen X, expecting YZ" },
        { icon: "✓", text: "A → XYZ•", detail: "Seen everything, ready to reduce" }
      ],
      example: "E → E + • T means we've seen 'E +' and expect 'T'"
    }
  },

  // CLOSURE AND GOTO
  {
    id: 18,
    section: "lr-parsing",
    type: "concept",
    title: "Closure and Goto",
    content: {
      description: "Two key operations for building LR states:",
      items: [
        { icon: "🔄", text: "CLOSURE(I)", detail: "If A → α•Bβ ∈ I, add B → •γ for all productions B → γ" },
        { icon: "➡️", text: "GOTO(I, X)", detail: "Move dot past X: {A → αX•β | A → α•Xβ ∈ I}, then take closure" }
      ],
      note: "CLOSURE adds items when dot is before non-terminal. GOTO follows transitions."
    }
  },

  // LR STATE CONSTRUCTION
  {
    id: 19,
    section: "lr-parsing",
    type: "algorithm",
    title: "LR(0) State Construction",
    content: {
      code: `Algorithm BuildLR0States:
  // Start state: closure of S' → •S
  I₀ = CLOSURE({S' → •S})
  states = {I₀}
  
  repeat until no new states:
    for each state I in states:
      for each symbol X (terminal or non-terminal):
        J = GOTO(I, X)
        if J is not empty and J ∉ states:
          states = states ∪ {J}
          
CLOSURE(I):
  repeat until no change:
    for each item A → α•Bβ in I:
      for each production B → γ:
        add B → •γ to I
  return I
  
GOTO(I, X):
  return CLOSURE({A → αX•β | A → α•Xβ ∈ I})`
    }
  },

  // LR STATE INTERACTIVE
  {
    id: 20,
    section: "lr-parsing",
    type: "interactive",
    title: "LR(0) State Construction Demo",
    content: {
      description: "Build LR(0) automaton states step by step:"
    },
    interactive: { type: "lr-state-builder" }
  },

  // SLR TABLE CONSTRUCTION
  {
    id: 21,
    section: "lr-parsing",
    type: "concept",
    title: "SLR(1) Table Construction",
    content: {
      description: "Build ACTION and GOTO tables from LR(0) states:",
      items: [
        { icon: "➡️", text: "Shift", detail: "If A → α•aβ ∈ Iᵢ and GOTO(Iᵢ,a) = Iⱼ, then ACTION[i,a] = shift j" },
        { icon: "⬅️", text: "Reduce", detail: "If A → α• ∈ Iᵢ, then for all a ∈ FOLLOW(A), ACTION[i,a] = reduce A→α" },
        { icon: "✓", text: "Accept", detail: "If S' → S• ∈ Iᵢ, then ACTION[i,$] = accept" },
        { icon: "📍", text: "Goto", detail: "If GOTO(Iᵢ,A) = Iⱼ for non-terminal A, then GOTO[i,A] = j" }
      ]
    }
  },

  // SLR TABLE ALGORITHM
  {
    id: 22,
    section: "lr-parsing",
    type: "algorithm",
    title: "SLR(1) Table Algorithm",
    content: {
      code: `Algorithm BuildSLRTable:
  Construct LR(0) item sets {I₀, I₁, ..., Iₙ}
  State i corresponds to Iᵢ
  
  for each state i:
    for each item A → α•aβ in Iᵢ (a is terminal):
      if GOTO(Iᵢ, a) = Iⱼ:
        ACTION[i, a] = shift j
        
    for each item A → α• in Iᵢ (A ≠ S'):
      for each a in FOLLOW(A):
        ACTION[i, a] = reduce A → α
        
    if S' → S• in Iᵢ:
      ACTION[i, $] = accept
      
    for each non-terminal A:
      if GOTO(Iᵢ, A) = Iⱼ:
        GOTO[i, A] = j
        
  // Conflicts: shift-reduce or reduce-reduce
  // indicate grammar is not SLR(1)`
    }
  },

  // LR TABLE INTERACTIVE
  {
    id: 23,
    section: "lr-parsing",
    type: "interactive",
    title: "SLR(1) Table Construction Demo",
    content: {
      description: "Build the complete SLR parsing table:"
    },
    interactive: { type: "slr-table-builder" }
  },

  // LR PARSER SIMULATION
  {
    id: 24,
    section: "lr-parsing",
    type: "interactive",
    title: "LR Parser in Action",
    content: {
      description: "Watch shift-reduce parsing of 'id * id + id':"
    },
    interactive: { type: "lr-parser" }
  },

  // LR GRAMMAR CLASSES
  {
    id: 25,
    section: "lr-parsing",
    type: "comparison",
    title: "LR Grammar Hierarchy",
    content: {
      approaches: [
        {
          name: "LR(0)",
          pros: ["Simplest construction"],
          cons: ["Very restrictive", "Most grammars fail"],
          note: "Reduce based on state alone"
        },
        {
          name: "SLR(1)",
          pros: ["Same states as LR(0)", "Compact tables"],
          cons: ["Some grammars still fail"],
          note: "Use FOLLOW for reduce decisions"
        },
        {
          name: "LALR(1)",
          pros: ["Handles most programming languages", "Compact tables"],
          cons: ["Complex construction"],
          note: "Yacc, Bison use this"
        },
        {
          name: "LR(1)",
          pros: ["Most powerful deterministic"],
          cons: ["Very large tables"],
          note: "Full canonical LR"
        }
      ]
    }
  },

  // SUMMARY
  {
    id: 26,
    section: "summary",
    type: "summary",
    title: "Chapter 2 Summary",
    content: {
      sections: [
        {
          title: "FIRST & FOLLOW",
          points: [
            "FIRST(α) = terminals that can begin α",
            "FOLLOW(A) = terminals that can follow A",
            "Used to build LL(1) parsing tables",
            "Fixed-point algorithms"
          ]
        },
        {
          title: "LL(1) Parsing",
          points: [
            "Top-down, predictive parsing",
            "Table M[A,a] gives production to use",
            "No left recursion allowed",
            "Easy to hand-code"
          ]
        },
        {
          title: "LR Parsing",
          points: [
            "Bottom-up, shift-reduce parsing",
            "LR(0) items track progress",
            "CLOSURE and GOTO build states",
            "SLR uses FOLLOW for reduces"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// FIRST Set Builder - Step by step computation
const FirstSetBuilder = () => {
  const [step, setStep] = useState(0);

  const grammar = [
    "E  → T E'",
    "E' → + T E' | ε",
    "T  → F T'",
    "T' → * F T' | ε",
    "F  → ( E ) | id"
  ];

  const steps = [
    { 
      title: "Initialize FIRST sets",
      sets: { E: [], "E'": [], T: [], "T'": [], F: [] },
      explanation: "Start with empty sets for all non-terminals. Terminals have FIRST = {themselves}."
    },
    { 
      title: "Process F → ( E ) | id",
      sets: { E: [], "E'": [], T: [], "T'": [], F: ['(', 'id'] },
      explanation: "F starts with '(' or 'id', so FIRST(F) = { (, id }",
      highlight: "F"
    },
    { 
      title: "Process T' → * F T' | ε",
      sets: { E: [], "E'": [], T: [], "T'": ['*', 'ε'], F: ['(', 'id'] },
      explanation: "T' starts with '*' or derives ε, so FIRST(T') = { *, ε }",
      highlight: "T'"
    },
    { 
      title: "Process T → F T'",
      sets: { E: [], "E'": [], T: ['(', 'id'], "T'": ['*', 'ε'], F: ['(', 'id'] },
      explanation: "T starts with F, and F cannot derive ε, so FIRST(T) = FIRST(F) = { (, id }",
      highlight: "T"
    },
    { 
      title: "Process E' → + T E' | ε",
      sets: { E: [], "E'": ['+', 'ε'], T: ['(', 'id'], "T'": ['*', 'ε'], F: ['(', 'id'] },
      explanation: "E' starts with '+' or derives ε, so FIRST(E') = { +, ε }",
      highlight: "E'"
    },
    { 
      title: "Process E → T E'",
      sets: { E: ['(', 'id'], "E'": ['+', 'ε'], T: ['(', 'id'], "T'": ['*', 'ε'], F: ['(', 'id'] },
      explanation: "E starts with T, and T cannot derive ε, so FIRST(E) = FIRST(T) = { (, id }",
      highlight: "E"
    },
    { 
      title: "✓ FIRST sets complete!",
      sets: { E: ['(', 'id'], "E'": ['+', 'ε'], T: ['(', 'id'], "T'": ['*', 'ε'], F: ['(', 'id'] },
      explanation: "No more changes possible. FIRST set computation is complete.",
      highlight: null
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: FIRST Set Construction</div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">Grammar:</div>
          <div className="font-mono text-base space-y-1">
            {grammar.map((prod, i) => (
              <div key={i} className="text-green-400">{prod}</div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">FIRST Sets:</div>
          <div className="space-y-2">
            {Object.entries(current.sets).map(([nt, first]) => (
              <div key={nt} className={`flex items-center gap-2 ${current.highlight === nt ? 'bg-purple-500/30 -mx-2 px-2 py-1 rounded' : ''}`}>
                <span className="font-mono text-purple-400 w-8">{nt}:</span>
                <span className="font-mono text-amber-400">
                  {first.length > 0 ? `{ ${first.join(', ')} }` : '{ }'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-purple-500/20 p-4 rounded-lg mb-4">
        <div className="text-purple-400 font-bold text-lg">{current.title}</div>
        <div className="text-slate-300 mt-2">{current.explanation}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">Step {step + 1} / {steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// FOLLOW Set Builder
const FollowSetBuilder = () => {
  const [step, setStep] = useState(0);

  const grammar = [
    "E  → T E'",
    "E' → + T E' | ε",
    "T  → F T'",
    "T' → * F T' | ε",
    "F  → ( E ) | id"
  ];

  const firstSets = "FIRST: E={(,id}, E'={+,ε}, T={(,id}, T'={*,ε}, F={(,id}";

  const steps = [
    { 
      title: "Initialize: Add $ to FOLLOW(E)",
      sets: { E: ['$'], "E'": [], T: [], "T'": [], F: [] },
      explanation: "E is the start symbol, so $ (end of input) is in FOLLOW(E).",
      rule: "Rule 1: $ ∈ FOLLOW(start symbol)"
    },
    { 
      title: "E → T E': Add FIRST(E') to FOLLOW(T)",
      sets: { E: ['$'], "E'": [], T: ['+'], "T'": [], F: [] },
      explanation: "E' follows T. FIRST(E') = {+, ε}, so add + to FOLLOW(T).",
      rule: "Rule 2: A → αBβ ⟹ FIRST(β)-{ε} ⊆ FOLLOW(B)"
    },
    { 
      title: "E → T E': Since ε ∈ FIRST(E'), add FOLLOW(E) to FOLLOW(T)",
      sets: { E: ['$'], "E'": [], T: ['+', '$'], "T'": [], F: [] },
      explanation: "E' can derive ε, so what follows E can follow T.",
      rule: "Rule 3: A → αBβ where ε∈FIRST(β) ⟹ FOLLOW(A) ⊆ FOLLOW(B)"
    },
    { 
      title: "E → T E': Add FOLLOW(E) to FOLLOW(E')",
      sets: { E: ['$'], "E'": ['$'], T: ['+', '$'], "T'": [], F: [] },
      explanation: "E' is at the end of production, so FOLLOW(E) ⊆ FOLLOW(E').",
      rule: "Rule 3: A → αB ⟹ FOLLOW(A) ⊆ FOLLOW(B)"
    },
    { 
      title: "E' → + T E': Add FIRST(E') - {ε} to FOLLOW(T)",
      sets: { E: ['$'], "E'": ['$'], T: ['+', '$'], "T'": [], F: [] },
      explanation: "E' follows T. FIRST(E') - {ε} = {+}, already in FOLLOW(T).",
      rule: "Rule 2 (no change)"
    },
    { 
      title: "T → F T': Add FIRST(T') - {ε} to FOLLOW(F)",
      sets: { E: ['$'], "E'": ['$'], T: ['+', '$'], "T'": [], F: ['*'] },
      explanation: "T' follows F. FIRST(T') = {*, ε}, add * to FOLLOW(F).",
      rule: "Rule 2"
    },
    { 
      title: "T → F T': Since ε ∈ FIRST(T'), add FOLLOW(T) to FOLLOW(F)",
      sets: { E: ['$'], "E'": ['$'], T: ['+', '$'], "T'": [], F: ['*', '+', '$'] },
      explanation: "T' can be ε, so FOLLOW(T) = {+, $} added to FOLLOW(F).",
      rule: "Rule 3"
    },
    { 
      title: "T → F T': Add FOLLOW(T) to FOLLOW(T')",
      sets: { E: ['$'], "E'": ['$'], T: ['+', '$'], "T'": ['+', '$'], F: ['*', '+', '$'] },
      explanation: "T' is at the end of production T → F T'.",
      rule: "Rule 3"
    },
    { 
      title: "F → ( E ): Add ) to FOLLOW(E)",
      sets: { E: ['$', ')'], "E'": ['$', ')'], T: ['+', '$', ')'], "T'": ['+', '$', ')'], F: ['*', '+', '$', ')'] },
      explanation: "')' follows E. This propagates through E', T, T', F.",
      rule: "Rule 2 + propagation"
    },
    { 
      title: "✓ FOLLOW sets complete!",
      sets: { E: [')', '$'], "E'": [')', '$'], T: ['+', ')', '$'], "T'": ['+', ')', '$'], F: ['*', '+', ')', '$'] },
      explanation: "Fixed point reached. No more changes possible.",
      rule: "Algorithm terminates"
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: FOLLOW Set Construction</div>
      
      <div className="bg-slate-900 p-3 rounded-lg mb-4">
        <div className="text-slate-400 text-sm">{firstSets}</div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-sm mb-2">FOLLOW Sets:</div>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(current.sets).map(([nt, follow]) => (
            <div key={nt} className="bg-slate-800 p-2 rounded text-center">
              <div className="font-mono text-purple-400 text-sm">{nt}</div>
              <div className="font-mono text-green-400 text-sm">
                {follow.length > 0 ? follow.join(' ') : '∅'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-500/20 p-4 rounded-lg mb-4">
        <div className="text-purple-400 font-bold">{current.title}</div>
        <div className="text-slate-300 text-sm mt-1">{current.explanation}</div>
        <div className="text-amber-400 text-sm mt-2 font-mono">{current.rule}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// LL(1) Table Builder
const LL1TableBuilder = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Start with empty table",
      table: {},
      explanation: "Build table M[non-terminal, terminal] for each production.",
      production: null
    },
    {
      title: "E → T E' (FIRST = {(, id})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'" },
      explanation: "FIRST(T E') = {(, id}. Add E → T E' to M[E, (] and M[E, id].",
      production: "E → T E'"
    },
    {
      title: "E' → + T E' (FIRST = {+})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'" },
      explanation: "FIRST(+ T E') = {+}. Add E' → + T E' to M[E', +].",
      production: "E' → + T E'"
    },
    {
      title: "E' → ε (FOLLOW(E') = {), $})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε" },
      explanation: "ε production: add E' → ε for each terminal in FOLLOW(E').",
      production: "E' → ε"
    },
    {
      title: "T → F T' (FIRST = {(, id})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'" },
      explanation: "FIRST(F T') = {(, id}. Add T → F T' to M[T, (] and M[T, id].",
      production: "T → F T'"
    },
    {
      title: "T' → * F T' (FIRST = {*})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'", "T',*": "T'→*FT'" },
      explanation: "FIRST(* F T') = {*}. Add T' → * F T' to M[T', *].",
      production: "T' → * F T'"
    },
    {
      title: "T' → ε (FOLLOW(T') = {+, ), $})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'", "T',*": "T'→*FT'", "T',+": "T'→ε", "T',)": "T'→ε", "T',$": "T'→ε" },
      explanation: "ε production: add T' → ε for each terminal in FOLLOW(T').",
      production: "T' → ε"
    },
    {
      title: "F → ( E ) (FIRST = {(})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'", "T',*": "T'→*FT'", "T',+": "T'→ε", "T',)": "T'→ε", "T',$": "T'→ε", 'F,(': "F→(E)" },
      explanation: "FIRST(( E )) = {(}. Add F → ( E ) to M[F, (].",
      production: "F → ( E )"
    },
    {
      title: "F → id (FIRST = {id})",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'", "T',*": "T'→*FT'", "T',+": "T'→ε", "T',)": "T'→ε", "T',$": "T'→ε", 'F,(': "F→(E)", 'F,id': "F→id" },
      explanation: "FIRST(id) = {id}. Add F → id to M[F, id].",
      production: "F → id"
    },
    {
      title: "✓ LL(1) Table Complete!",
      table: { 'E,(': "E→TE'", 'E,id': "E→TE'", "E',+": "E'→+TE'", "E',)": "E'→ε", "E',$": "E'→ε", 'T,(': "T→FT'", 'T,id': "T→FT'", "T',*": "T'→*FT'", "T',+": "T'→ε", "T',)": "T'→ε", "T',$": "T'→ε", 'F,(': "F→(E)", 'F,id': "F→id" },
      explanation: "No conflicts! This grammar is LL(1). Each cell has at most one entry.",
      production: null
    }
  ];

  const current = steps[step];
  const nonTerminals = ['E', "E'", 'T', "T'", 'F'];
  const terminals = ['id', '+', '*', '(', ')', '$'];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: LL(1) Table Construction</div>
      
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 bg-slate-700 text-slate-300">M</th>
              {terminals.map(t => (
                <th key={t} className="p-2 bg-slate-700 text-amber-400 font-mono">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map(nt => (
              <tr key={nt}>
                <td className="p-2 bg-slate-700 text-purple-400 font-mono font-bold">{nt}</td>
                {terminals.map(t => {
                  const key = `${nt},${t}`;
                  const value = current.table[key];
                  const isNew = current.production && value?.includes(current.production.split(' ')[0]);
                  return (
                    <td key={t} className={`p-2 border border-slate-700 font-mono text-xs ${
                      value ? (isNew ? 'bg-purple-500/30 text-green-400' : 'bg-slate-900 text-green-400') : 'bg-slate-900 text-slate-600'
                    }`}>
                      {value || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-purple-500/20 p-4 rounded-lg mb-4">
        <div className="text-purple-400 font-bold">{current.title}</div>
        <div className="text-slate-300 text-sm mt-1">{current.explanation}</div>
        {current.production && (
          <div className="text-amber-400 font-mono mt-2">Processing: {current.production}</div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// LL Parser Simulator
const LLParserSimulator = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { stack: ['$', 'E'], input: 'id + id * id $', action: 'Start', rule: 'Initialize with $ and start symbol E' },
    { stack: ['$', "E'", 'T'], input: 'id + id * id $', action: 'Predict', rule: "M[E, id] = E → T E'" },
    { stack: ['$', "E'", "T'", 'F'], input: 'id + id * id $', action: 'Predict', rule: "M[T, id] = T → F T'" },
    { stack: ['$', "E'", "T'", 'id'], input: 'id + id * id $', action: 'Predict', rule: "M[F, id] = F → id" },
    { stack: ['$', "E'", "T'"], input: '+ id * id $', action: 'Match', rule: "Match id ✓" },
    { stack: ['$', "E'"], input: '+ id * id $', action: 'Predict', rule: "M[T', +] = T' → ε" },
    { stack: ['$', "E'", 'T', '+'], input: '+ id * id $', action: 'Predict', rule: "M[E', +] = E' → + T E'" },
    { stack: ['$', "E'", 'T'], input: 'id * id $', action: 'Match', rule: "Match + ✓" },
    { stack: ['$', "E'", "T'", 'F'], input: 'id * id $', action: 'Predict', rule: "M[T, id] = T → F T'" },
    { stack: ['$', "E'", "T'", 'id'], input: 'id * id $', action: 'Predict', rule: "M[F, id] = F → id" },
    { stack: ['$', "E'", "T'"], input: '* id $', action: 'Match', rule: "Match id ✓" },
    { stack: ['$', "E'", "T'", 'F', '*'], input: '* id $', action: 'Predict', rule: "M[T', *] = T' → * F T'" },
    { stack: ['$', "E'", "T'", 'F'], input: 'id $', action: 'Match', rule: "Match * ✓" },
    { stack: ['$', "E'", "T'", 'id'], input: 'id $', action: 'Predict', rule: "M[F, id] = F → id" },
    { stack: ['$', "E'", "T'"], input: '$', action: 'Match', rule: "Match id ✓" },
    { stack: ['$', "E'"], input: '$', action: 'Predict', rule: "M[T', $] = T' → ε" },
    { stack: ['$'], input: '$', action: 'Predict', rule: "M[E', $] = E' → ε" },
    { stack: [], input: '', action: 'Accept!', rule: "Stack and input both empty ✓" }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: LL(1) Parser Simulation</div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">Stack (top → right)</div>
          <div className="font-mono text-purple-400 text-lg flex flex-wrap gap-1">
            {current.stack.length > 0 ? current.stack.slice().reverse().map((s, i) => (
              <span key={i} className="px-2 py-1 bg-purple-500/20 rounded">{s}</span>
            )) : <span className="text-green-400">(empty)</span>}
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">Remaining Input</div>
          <div className="font-mono text-amber-400 text-lg">{current.input || '(empty)'}</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${
        current.action === 'Accept!' ? 'bg-green-500/20' :
        current.action === 'Predict' ? 'bg-blue-500/20' :
        current.action === 'Match' ? 'bg-amber-500/20' : 'bg-slate-900'
      }`}>
        <span className={`px-3 py-1 rounded font-bold mr-3 ${
          current.action === 'Accept!' ? 'bg-green-500' :
          current.action === 'Predict' ? 'bg-blue-500' : 'bg-amber-500'
        } text-white`}>{current.action}</span>
        <span className="text-white">{current.rule}</span>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// LR State Builder
const LRStateBuilder = () => {
  const [step, setStep] = useState(0);

  const grammar = "S'→E  E→E+T|T  T→T*F|F  F→(E)|id";

  const steps = [
    {
      title: "I₀: Start with S' → •E",
      items: ["S' → •E", "E → •E + T", "E → •T", "T → •T * F", "T → •F", "F → •( E )", "F → •id"],
      explanation: "Closure adds all items for non-terminals after dot. E after dot adds E productions, T after dot adds T productions, etc.",
      transitions: []
    },
    {
      title: "I₁ = GOTO(I₀, E)",
      items: ["S' → E•", "E → E• + T"],
      explanation: "Move dot past E in all items from I₀ where E is after dot, then take closure.",
      transitions: [{ from: 'I₀', symbol: 'E', to: 'I₁' }]
    },
    {
      title: "I₂ = GOTO(I₀, T)",
      items: ["E → T•", "T → T• * F"],
      explanation: "Move dot past T in items from I₀.",
      transitions: [{ from: 'I₀', symbol: 'T', to: 'I₂' }]
    },
    {
      title: "I₃ = GOTO(I₀, F)",
      items: ["T → F•"],
      explanation: "Move dot past F. This is a reduce item (dot at end).",
      transitions: [{ from: 'I₀', symbol: 'F', to: 'I₃' }]
    },
    {
      title: "I₄ = GOTO(I₀, '(')",
      items: ["F → (•E )", "E → •E + T", "E → •T", "T → •T * F", "T → •F", "F → •( E )", "F → •id"],
      explanation: "Move dot past '(', then closure adds E, T, F productions.",
      transitions: [{ from: 'I₀', symbol: '(', to: 'I₄' }]
    },
    {
      title: "I₅ = GOTO(I₀, id)",
      items: ["F → id•"],
      explanation: "Move dot past 'id'. Reduce item.",
      transitions: [{ from: 'I₀', symbol: 'id', to: 'I₅' }]
    },
    {
      title: "I₆ = GOTO(I₁, '+')",
      items: ["E → E +• T", "T → •T * F", "T → •F", "F → •( E )", "F → •id"],
      explanation: "From I₁, move dot past '+'. Closure adds T and F productions.",
      transitions: [{ from: 'I₁', symbol: '+', to: 'I₆' }]
    },
    {
      title: "I₇ = GOTO(I₂, '*')",
      items: ["T → T *• F", "F → •( E )", "F → •id"],
      explanation: "From I₂, move dot past '*'. Closure adds F productions.",
      transitions: [{ from: 'I₂', symbol: '*', to: 'I₇' }]
    },
    {
      title: "More states...",
      items: ["I₈ = GOTO(I₄, E): F → ( E• )", "I₉ = GOTO(I₆, T): E → E + T•", "I₁₀ = GOTO(I₇, F): T → T * F•", "I₁₁ = GOTO(I₈, ')': F → ( E )•"],
      explanation: "Continue until no new states. Total: 12 states for this grammar.",
      transitions: []
    },
    {
      title: "✓ LR(0) Automaton Complete",
      items: ["12 states total", "Transitions on terminals → shifts", "Transitions on non-terminals → gotos", "Items with dot at end → reduces"],
      explanation: "This automaton recognizes viable prefixes. Used to build parsing table.",
      transitions: []
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: LR(0) State Construction</div>
      
      <div className="bg-slate-900 p-3 rounded-lg mb-4">
        <span className="text-slate-400 text-sm">Grammar: </span>
        <span className="text-green-400 font-mono text-sm">{grammar}</span>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-purple-400 font-bold mb-2">{current.title}</div>
        <div className="space-y-1">
          {current.items.map((item, i) => (
            <div key={i} className="font-mono text-amber-400 text-sm">{item}</div>
          ))}
        </div>
      </div>

      <div className="bg-purple-500/20 p-4 rounded-lg mb-4">
        <div className="text-slate-300 text-sm">{current.explanation}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// SLR Table Builder
const SLRTableBuilder = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Start with LR(0) states",
      action: null,
      table: {},
      explanation: "We have states I₀-I₁₁. Now build ACTION and GOTO tables."
    },
    {
      title: "State 0: Shift actions",
      action: "From I₀: GOTO(I₀,id)=I₅, GOTO(I₀,'(')=I₄",
      table: { '0,id': 's5', '0,(': 's4' },
      explanation: "Items with terminal after dot → shift to target state."
    },
    {
      title: "State 0: Goto entries",
      action: "GOTO(I₀,E)=I₁, GOTO(I₀,T)=I₂, GOTO(I₀,F)=I₃",
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3' },
      explanation: "Non-terminal transitions become GOTO entries."
    },
    {
      title: "State 1: Accept and shift",
      action: "S' → E• means accept on $. E → E•+T means shift + to I₆",
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3', '1,$': 'acc', '1,+': 's6' },
      explanation: "S' → E• with $ is accept. Shift for +"
    },
    {
      title: "State 2: Reduce and shift",
      action: "E → T• reduces. T → T•*F shifts * to I₇",
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3', '1,$': 'acc', '1,+': 's6', '2,*': 's7', '2,+': 'r2', '2,)': 'r2', '2,$': 'r2' },
      explanation: "Reduce E→T on FOLLOW(E)={+,),$}. Shift * to I₇."
    },
    {
      title: "State 3: Reduce T → F",
      action: "T → F• is complete → reduce",
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3', '1,$': 'acc', '1,+': 's6', '2,*': 's7', '2,+': 'r2', '2,)': 'r2', '2,$': 'r2', '3,*': 'r4', '3,+': 'r4', '3,)': 'r4', '3,$': 'r4' },
      explanation: "Reduce T→F on FOLLOW(T)={*,+,),$}"
    },
    {
      title: "State 5: Reduce F → id",
      action: "F → id• is complete → reduce",
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3', '1,$': 'acc', '1,+': 's6', '2,*': 's7', '2,+': 'r2', '2,)': 'r2', '2,$': 'r2', '3,*': 'r4', '3,+': 'r4', '3,)': 'r4', '3,$': 'r4', '5,*': 'r6', '5,+': 'r6', '5,)': 'r6', '5,$': 'r6' },
      explanation: "Reduce F→id on FOLLOW(F)={*,+,),$}"
    },
    {
      title: "✓ SLR(1) Table Complete",
      action: null,
      table: { '0,id': 's5', '0,(': 's4', '0,E': '1', '0,T': '2', '0,F': '3', '1,$': 'acc', '1,+': 's6', '2,*': 's7', '2,+': 'r2', '2,)': 'r2', '2,$': 'r2', '3,*': 'r4', '3,+': 'r4', '3,)': 'r4', '3,$': 'r4', '5,*': 'r6', '5,+': 'r6', '5,)': 'r6', '5,$': 'r6' },
      explanation: "No conflicts! Grammar is SLR(1). sN=shift to state N, rN=reduce by production N, acc=accept"
    }
  ];

  const current = steps[step];
  const states = [0, 1, 2, 3, 5];
  const symbols = ['id', '+', '*', '(', ')', '$', 'E', 'T', 'F'];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: SLR(1) Table Construction</div>
      
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1 bg-slate-700 text-slate-300">State</th>
              {symbols.map(s => (
                <th key={s} className={`p-1 bg-slate-700 font-mono ${s.match(/[A-Z]/) ? 'text-purple-400' : 'text-amber-400'}`}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map(st => (
              <tr key={st}>
                <td className="p-1 bg-slate-700 text-white font-bold text-center">{st}</td>
                {symbols.map(sym => {
                  const key = `${st},${sym}`;
                  const val = current.table[key];
                  return (
                    <td key={sym} className={`p-1 border border-slate-700 font-mono text-center ${
                      val?.startsWith('s') ? 'bg-blue-500/20 text-blue-400' :
                      val?.startsWith('r') ? 'bg-orange-500/20 text-orange-400' :
                      val === 'acc' ? 'bg-green-500/20 text-green-400' :
                      val ? 'bg-slate-900 text-purple-400' : 'bg-slate-900 text-slate-600'
                    }`}>
                      {val || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-purple-500/20 p-4 rounded-lg mb-4">
        <div className="text-purple-400 font-bold">{current.title}</div>
        {current.action && <div className="text-amber-400 font-mono text-sm mt-1">{current.action}</div>}
        <div className="text-slate-300 text-sm mt-2">{current.explanation}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// LR Parser Simulator
const LRParserSimulator = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { stack: [0], symbols: [], input: 'id * id + id $', action: 'Start', desc: 'Initialize with state 0' },
    { stack: [0, 5], symbols: ['id'], input: '* id + id $', action: 'Shift 5', desc: 'ACTION[0,id] = s5' },
    { stack: [0, 3], symbols: ['F'], input: '* id + id $', action: 'Reduce 6', desc: 'F → id, GOTO[0,F] = 3' },
    { stack: [0, 2], symbols: ['T'], input: '* id + id $', action: 'Reduce 4', desc: 'T → F, GOTO[0,T] = 2' },
    { stack: [0, 2, 7], symbols: ['T', '*'], input: 'id + id $', action: 'Shift 7', desc: 'ACTION[2,*] = s7' },
    { stack: [0, 2, 7, 5], symbols: ['T', '*', 'id'], input: '+ id $', action: 'Shift 5', desc: 'ACTION[7,id] = s5' },
    { stack: [0, 2, 7, 10], symbols: ['T', '*', 'F'], input: '+ id $', action: 'Reduce 6', desc: 'F → id, GOTO[7,F] = 10' },
    { stack: [0, 2], symbols: ['T'], input: '+ id $', action: 'Reduce 3', desc: 'T → T * F, GOTO[0,T] = 2' },
    { stack: [0, 1], symbols: ['E'], input: '+ id $', action: 'Reduce 2', desc: 'E → T, GOTO[0,E] = 1' },
    { stack: [0, 1, 6], symbols: ['E', '+'], input: 'id $', action: 'Shift 6', desc: 'ACTION[1,+] = s6' },
    { stack: [0, 1, 6, 5], symbols: ['E', '+', 'id'], input: '$', action: 'Shift 5', desc: 'ACTION[6,id] = s5' },
    { stack: [0, 1, 6, 3], symbols: ['E', '+', 'F'], input: '$', action: 'Reduce 6', desc: 'F → id' },
    { stack: [0, 1, 6, 9], symbols: ['E', '+', 'T'], input: '$', action: 'Reduce 4', desc: 'T → F' },
    { stack: [0, 1], symbols: ['E'], input: '$', action: 'Reduce 1', desc: 'E → E + T' },
    { stack: [], symbols: [], input: '', action: 'Accept!', desc: '✓ Parse successful!' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-purple-400 text-lg mb-4 font-mono">Interactive: LR Parser (id * id + id)</div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-400 text-sm mb-1">State Stack</div>
          <div className="font-mono text-purple-400">
            {current.stack.length > 0 ? current.stack.join(' ') : '—'}
          </div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-400 text-sm mb-1">Symbol Stack</div>
          <div className="font-mono text-green-400">
            {current.symbols.length > 0 ? current.symbols.join(' ') : '—'}
          </div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-400 text-sm mb-1">Input</div>
          <div className="font-mono text-amber-400">{current.input || '—'}</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${
        current.action === 'Accept!' ? 'bg-green-500/20' :
        current.action.startsWith('Shift') ? 'bg-blue-500/20' :
        current.action.startsWith('Reduce') ? 'bg-orange-500/20' : 'bg-slate-900'
      }`}>
        <span className={`px-3 py-1 rounded font-bold mr-3 ${
          current.action === 'Accept!' ? 'bg-green-500' :
          current.action.startsWith('Shift') ? 'bg-blue-500' : 'bg-orange-500'
        } text-white`}>{current.action}</span>
        <span className="text-white">{current.desc}</span>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <span className="px-4 py-2 text-slate-400">{step + 1}/{steps.length}</span>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">📜</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-purple-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-4 text-purple-400 italic text-lg">{slide.content.note}</p>}
    {slide.content.example && <div className="mt-4 bg-slate-900 p-4 rounded-lg text-green-400 font-mono">{slide.content.example}</div>}
    {slide.interactive?.type === 'first-set-builder' && <FirstSetBuilder />}
    {slide.interactive?.type === 'follow-set-builder' && <FollowSetBuilder />}
    {slide.interactive?.type === 'll1-table-builder' && <LL1TableBuilder />}
    {slide.interactive?.type === 'll-parser' && <LLParserSimulator />}
    {slide.interactive?.type === 'lr-state-builder' && <LRStateBuilder />}
    {slide.interactive?.type === 'slr-table-builder' && <SLRTableBuilder />}
    {slide.interactive?.type === 'lr-parser' && <LRParserSimulator />}
  </div>
);

const DefinitionSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.definition && <p className="text-2xl text-purple-400 mb-6 italic">{slide.content.definition}</p>}
    {slide.content.items && (
      <div className="space-y-4">
        {slide.content.items.map((item, i) => (
          <div key={i} className="bg-slate-800/50 p-4 rounded-lg">
            <span className="text-purple-400 font-bold text-xl">{item.term}: </span>
            <span className="text-slate-300 text-xl">{item.definition}</span>
            {item.example && <span className="text-amber-400 text-lg ml-2">e.g., {item.example}</span>}
          </div>
        ))}
      </div>
    )}
  </div>
);

const GrammarSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.title && <h3 className="text-2xl text-purple-400 mb-4">{slide.content.title}</h3>}
    {slide.content.productions && (
      <div className="bg-slate-900 p-6 rounded-lg mb-6">
        {slide.content.productions.map((prod, i) => (
          <div key={i} className="text-green-400 font-mono text-xl mb-2">{prod}</div>
        ))}
      </div>
    )}
    {slide.content.properties && (
      <div className="space-y-2">
        {slide.content.properties.map((prop, i) => (
          <div key={i} className="text-slate-300 text-lg">• {prop}</div>
        ))}
      </div>
    )}
  </div>
);

const AlgorithmSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.code && (
      <div className="bg-slate-900 p-6 rounded-lg">
        <pre className="text-green-400 font-mono text-base whitespace-pre-wrap">{slide.content.code}</pre>
      </div>
    )}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-5 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-green-400'}`}>{a.name}</h3>
          {a.meaning && <p className="text-slate-400 text-lg mb-2">{a.meaning}</p>}
          {a.how && <p className="text-slate-300 mb-2">{a.how}</p>}
          {a.direction && <p className="text-slate-300 mb-2">{a.direction}</p>}
          {a.actions && <p className="text-slate-300 mb-2">Actions: {a.actions.join(', ')}</p>}
          {a.tools && <p className="text-slate-500 text-sm">Tools: {a.tools}</p>}
          {a.pros && <div className="text-green-400 text-sm mt-2">+ {a.pros.join(', ')}</div>}
          {a.cons && <div className="text-red-400 text-sm">- {a.cons.join(', ')}</div>}
          {a.note && <div className="text-amber-400 text-sm mt-1">{a.note}</div>}
        </div>
      ))}
    </div>
    {slide.content.insight && <p className="mt-6 text-purple-400 italic text-xl text-center">{slide.content.insight}</p>}
  </div>
);

const InteractiveSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-4">{slide.content.description}</p>}
    {slide.interactive?.type === 'first-set-builder' && <FirstSetBuilder />}
    {slide.interactive?.type === 'follow-set-builder' && <FollowSetBuilder />}
    {slide.interactive?.type === 'll1-table-builder' && <LL1TableBuilder />}
    {slide.interactive?.type === 'll-parser' && <LLParserSimulator />}
    {slide.interactive?.type === 'lr-state-builder' && <LRStateBuilder />}
    {slide.interactive?.type === 'slr-table-builder' && <SLRTableBuilder />}
    {slide.interactive?.type === 'lr-parser' && <LRParserSimulator />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-5 rounded-xl">
          <h3 className="text-purple-400 font-bold text-xl mb-4">{section.title}</h3>
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
    case 'definition': return <DefinitionSlide slide={slide} />;
    case 'grammar': return <GrammarSlide slide={slide} />;
    case 'algorithm': return <AlgorithmSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'interactive': return <InteractiveSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter2Slides() {
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
            <span className="text-purple-400 font-bold text-lg">Ch 2: Programming Language Syntax</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{currentSlide + 1} / {SLIDES.length}</span>
            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm">{slide.section}</span>
          </div>
        </div>
      </header>

      {/* Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 p-4 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Chapter 2 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-purple-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-sm ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-purple-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-purple-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 rounded text-lg disabled:opacity-30">
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

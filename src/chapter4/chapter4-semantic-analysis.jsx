import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 4: SEMANTIC ANALYSIS
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 4,
  title: "Semantic Analysis",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#10b981" // emerald/green
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
    title: "Chapter 4: Semantic Analysis",
    content: {
      subtitle: "Understanding Program Meaning",
      topics: [
        "Role of Semantic Analysis",
        "Attribute Grammars",
        "Synthesized vs Inherited Attributes",
        "S-Attributed & L-Attributed Grammars",
        "Action Routines",
        "Parse Trees vs Syntax Trees"
      ]
    }
  },

  // ROLE OF SEMANTIC ANALYSIS
  {
    id: 2,
    section: "role",
    type: "concept",
    title: "Role of Semantic Analysis",
    content: {
      description: "Following parsing, the compiler performs semantic analysis:",
      items: [
        { icon: "✓", text: "Enforce Static Semantic Rules", detail: "Type checking, scope resolution, declaration requirements" },
        { icon: "🌳", text: "Construct Syntax Tree", detail: "Abstract representation of program structure" },
        { icon: "📊", text: "Gather Information", detail: "Type info, symbol tables for code generation" },
        { icon: "🔗", text: "Resolve References", detail: "Connect variable uses to declarations" }
      ],
      note: "Static semantics = what can be checked at compile time"
    }
  },

  // COMPILATION PHASES
  {
    id: 3,
    section: "role",
    type: "diagram",
    title: "Where Semantic Analysis Fits",
    content: {
      phases: [
        { name: "Scanner", output: "Tokens", done: true },
        { name: "Parser", output: "Parse Tree", done: true },
        { name: "Semantic Analyzer", output: "Decorated AST", current: true },
        { name: "IR Generator", output: "Intermediate Code", done: false },
        { name: "Optimizer", output: "Optimized IR", done: false },
        { name: "Code Generator", output: "Machine Code", done: false }
      ],
      note: "These phases may be interleaved or separate depending on compiler design"
    }
  },

  // INTERLEAVING
  {
    id: 4,
    section: "role",
    type: "comparison",
    title: "Interleaved vs Separate Phases",
    content: {
      approaches: [
        {
          name: "Interleaved (One-Pass)",
          pros: ["Memory efficient", "No explicit tree needed", "Fast for simple languages"],
          cons: ["Limited optimization", "Forward references hard", "Must be L-attributed"],
          example: "Early Pascal compilers"
        },
        {
          name: "Separate Phases",
          pros: ["More optimization possible", "Cleaner design", "Can use complex traversals"],
          cons: ["More memory", "Multiple passes", "Slower compilation"],
          example: "Modern optimizing compilers"
        }
      ]
    }
  },

  // ATTRIBUTE GRAMMARS INTRO
  {
    id: 5,
    section: "attributes",
    type: "definition",
    title: "Attribute Grammars",
    content: {
      definition: "A formal framework for decorating parse/syntax trees with semantic information:",
      items: [
        { term: "Attribute", definition: "A property associated with a grammar symbol", example: "val, type, code, env" },
        { term: "Semantic Rule", definition: "Defines how to compute an attribute", example: "E.val = E1.val + T.val" },
        { term: "Decoration", definition: "Process of computing all attributes", example: "Bottom-up or mixed traversal" },
        { term: "Semantic Function", definition: "The code that computes attribute values", example: "sum(a, b) { return a + b; }" }
      ]
    }
  },

  // SIMPLE EXPRESSION GRAMMAR
  {
    id: 6,
    section: "attributes",
    type: "grammar",
    title: "Expression Grammar (Syntax Only)",
    content: {
      title: "LR grammar for arithmetic expressions:",
      productions: [
        "E → E + T",
        "E → E - T", 
        "E → T",
        "T → T * F",
        "T → T / F",
        "T → F",
        "F → - F",
        "F → ( E )",
        "F → const"
      ],
      note: "This grammar says nothing about what the program MEANS - just its structure"
    }
  },

  // ATTRIBUTE GRAMMAR
  {
    id: 7,
    section: "attributes",
    type: "grammar",
    title: "Expression Grammar (With Semantics)",
    content: {
      title: "Adding semantic rules to compute values:",
      productions: [
        "E → E + T    { E₁.val = E₂.val + T.val }",
        "E → E - T    { E₁.val = E₂.val - T.val }",
        "E → T       { E.val = T.val }",
        "T → T * F    { T₁.val = T₂.val * F.val }",
        "T → T / F    { T₁.val = T₂.val / F.val }",
        "T → F       { T.val = F.val }",
        "F → - F     { F₁.val = -F₂.val }",
        "F → ( E )    { F.val = E.val }",
        "F → const    { F.val = const.val }"
      ],
      note: "Rules are DEFINITIONS, not assignments - they specify relationships"
    },
    interactive: { type: "attribute-grammar" }
  },

  // SYNTHESIZED ATTRIBUTES
  {
    id: 8,
    section: "attributes",
    type: "concept",
    title: "Synthesized Attributes",
    content: {
      description: "Attributes computed from children (bottom-up flow):",
      items: [
        { icon: "⬆️", text: "Flow Direction", detail: "Information flows UP the tree from leaves to root" },
        { icon: "👶", text: "Dependency", detail: "Depends only on attributes of children in parse tree" },
        { icon: "📝", text: "Common Uses", detail: "Computed values, generated code, expression types" },
        { icon: "🔤", text: "Tokens", detail: "Have only synthesized attributes (from scanner)" }
      ],
      example: {
        rule: "E → E + T",
        computation: "E.val = E₁.val + T.val",
        explanation: "Parent's val computed from children's val"
      }
    }
  },

  // INHERITED ATTRIBUTES
  {
    id: 9,
    section: "attributes",
    type: "concept",
    title: "Inherited Attributes",
    content: {
      description: "Attributes passed down or across (top-down or left-right flow):",
      items: [
        { icon: "⬇️", text: "Flow Direction", detail: "Information flows DOWN from parent or LEFT from siblings" },
        { icon: "👪", text: "Dependency", detail: "May depend on parent or left siblings' attributes" },
        { icon: "📝", text: "Common Uses", detail: "Type context, environment/symbol table, label targets" },
        { icon: "🎯", text: "Start Symbol", detail: "Inherited attributes are compiler parameters (e.g., flags)" }
      ],
      example: {
        rule: "For type declarations",
        computation: "Pass type info down to variable list",
        explanation: "int a, b, c; → type 'int' inherited by a, b, c"
      }
    }
  },

  // SYNTHESIZED VS INHERITED VISUAL
  {
    id: 10,
    section: "attributes",
    type: "interactive",
    title: "Attribute Flow Visualization",
    content: {
      description: "See how synthesized and inherited attributes flow through the tree:"
    },
    interactive: { type: "attribute-flow" }
  },

  // S-ATTRIBUTED GRAMMARS
  {
    id: 11,
    section: "grammar-types",
    type: "definition",
    title: "S-Attributed Grammars",
    content: {
      definition: "Grammars using ONLY synthesized attributes:",
      items: [
        { term: "Property", definition: "All attributes computed bottom-up", example: "Expression evaluation" },
        { term: "Advantage", definition: "Can be evaluated in single bottom-up pass", example: "During LR parsing" },
        { term: "Limitation", definition: "Cannot pass context downward", example: "Type inheritance hard" },
        { term: "Typical Use", definition: "Calculator-style evaluation", example: "Our expression grammar" }
      ],
      note: "S-attributed ⊂ L-attributed (all S-attributed are also L-attributed)"
    }
  },

  // L-ATTRIBUTED GRAMMARS
  {
    id: 12,
    section: "grammar-types",
    type: "definition",
    title: "L-Attributed Grammars",
    content: {
      definition: "Grammars where attributes can be evaluated left-to-right:",
      items: [
        { 
          term: "Synthesized Rule", 
          definition: "LHS attribute depends only on RHS symbols", 
          example: "E.val = f(T.val, E'.val)" 
        },
        { 
          term: "Inherited Rule", 
          definition: "RHS attribute depends on LHS inherited OR symbols to its LEFT", 
          example: "T.env = E.env (from parent)" 
        },
        { 
          term: "Advantage", 
          definition: "Evaluated during LL parse (single pass)", 
          example: "Most practical compilers" 
        },
        { 
          term: "Key Property", 
          definition: "No right-to-left dependencies in a production", 
          example: "A → B C: C can't depend on B's synthesized attrs" 
        }
      ]
    }
  },

  // LL VS LR ATTRIBUTE EVALUATION
  {
    id: 13,
    section: "grammar-types",
    type: "comparison",
    title: "Attribute Evaluation: LL vs LR",
    content: {
      approaches: [
        {
          name: "LL Parsing (Top-Down)",
          pros: ["Inherited attributes easy", "L-attributed natural fit", "Predictive"],
          cons: ["Need to transform grammars", "Right recursion for left-to-right flow"],
          attributes: "Both synthesized and inherited"
        },
        {
          name: "LR Parsing (Bottom-Up)",
          pros: ["S-attributed natural fit", "Larger grammar class", "No transformation"],
          cons: ["Inherited attributes tricky", "Need 'markers' for inherited"],
          attributes: "Primarily synthesized"
        }
      ],
      insight: "LL + L-attributed is a very practical combination used in many compilers"
    }
  },

  // EVALUATING (1+3)*2 WITH VISUAL TREE
  {
    id: 14,
    section: "evaluation",
    type: "interactive",
    title: "Parse Tree Construction: (1 + 3) * 2",
    content: {
      expression: "(1 + 3) * 2",
      expectedResult: 8,
      description: "Watch the parse tree being built step-by-step with attribute values propagating upward:"
    },
    interactive: { type: "parse-tree-visual" }
  },

  // PARSE TREE VS AST VISUAL
  {
    id: 15,
    section: "evaluation",
    type: "interactive",
    title: "Visual: Parse Tree vs AST",
    content: {
      description: "Compare the verbose parse tree to the compact abstract syntax tree:"
    },
    interactive: { type: "ast-vs-parse" }
  },

  // ACTION ROUTINES
  {
    id: 16,
    section: "action",
    type: "concept",
    title: "Action Routines",
    content: {
      description: "Semantic functions executed at specific points during parsing:",
      items: [
        { icon: "⚡", text: "Definition", detail: "Code fragments embedded in grammar productions" },
        { icon: "📍", text: "Execution", detail: "Run when parser reaches that point in production" },
        { icon: "🎯", text: "Purpose", detail: "Semantic checks, tree building, code generation" },
        { icon: "📋", text: "Stack-Based", detail: "Often use attribute stack parallel to parse stack" }
      ],
      example: {
        production: "E → E + T",
        action: "{ push(pop() + pop()); }",
        explanation: "Pop two values, push their sum"
      }
    }
  },

  // ACTION ROUTINE EXAMPLE
  {
    id: 17,
    section: "action",
    type: "code",
    title: "Action Routines in Practice",
    content: {
      code: `/* Yacc/Bison style */
expr: expr '+' term   { $$ = $1 + $3; }
    | expr '-' term   { $$ = $1 - $3; }
    | term            { $$ = $1; }
    ;

term: term '*' factor { $$ = $1 * $3; }
    | term '/' factor { $$ = $1 / $3; }
    | factor          { $$ = $1; }
    ;

factor: '(' expr ')'  { $$ = $2; }
      | NUMBER        { $$ = $1; }
      ;`,
      explanation: [
        { label: "$$", meaning: "Synthesized attribute of LHS" },
        { label: "$1, $2, $3", meaning: "Attributes of RHS symbols (by position)" },
        { label: "{ ... }", meaning: "Action routine executed on reduction" }
      ]
    }
  },

  // ATTRIBUTE STACK
  {
    id: 18,
    section: "action",
    type: "interactive",
    title: "Attribute Stack Management",
    content: {
      description: "See how the attribute stack works during LR parsing:"
    },
    interactive: { type: "attribute-stack" }
  },

  // PARSE TREE VS SYNTAX TREE
  {
    id: 19,
    section: "trees",
    type: "comparison",
    title: "Parse Tree vs Syntax Tree (AST)",
    content: {
      approaches: [
        {
          name: "Parse Tree (Concrete Syntax Tree)",
          pros: ["Complete derivation", "Matches grammar exactly", "Auto-generated"],
          cons: ["Verbose", "Many useless nodes", "Wastes memory"],
          example: "Includes all non-terminals, parentheses nodes, etc."
        },
        {
          name: "Syntax Tree (Abstract Syntax Tree)",
          pros: ["Compact", "Semantically meaningful", "Easy to traverse"],
          cons: ["Must be explicitly constructed", "Grammar info lost"],
          example: "Only operators and operands, no punctuation"
        }
      ]
    },
    interactive: { type: "tree-comparison" }
  },

  // PARSE VS SYNTAX TREE DETAIL
  {
    id: 20,
    section: "trees",
    type: "table",
    title: "Parse Tree vs Syntax Tree Details",
    content: {
      headers: ["Aspect", "Parse Tree", "Syntax Tree (AST)"],
      rows: [
        ["Created by", "Parser automatically", "Semantic actions (explicit)"],
        ["Size", "Large (all grammar symbols)", "Compact (essential nodes)"],
        ["Punctuation", "Included as nodes", "Omitted"],
        ["Non-terminals", "All present", "Many eliminated"],
        ["Useful for", "Debugging grammar", "Semantic analysis, code gen"],
        ["Human readable", "Verbose, hard to read", "Clearer, more intuitive"],
        ["Whitespace/comments", "May have nodes", "Never included"]
      ]
    }
  },

  // BUILDING SYNTAX TREES
  {
    id: 21,
    section: "trees",
    type: "concept",
    title: "Building Syntax Trees",
    content: {
      description: "Syntax trees are built using synthesized attributes:",
      items: [
        { icon: "🌱", text: "Leaf Creation", detail: "F → const creates leaf node with value" },
        { icon: "🔗", text: "Node Creation", detail: "E → E + T creates '+' node with two children" },
        { icon: "⬆️", text: "Pointer Propagation", detail: "Synthesized attribute holds pointer to subtree" },
        { icon: "🌳", text: "Result", detail: "Root's attribute points to complete tree" }
      ],
      example: {
        production: "E → E₁ + T",
        action: "E.ptr = makeNode('+', E₁.ptr, T.ptr)",
        explanation: "Create + node, return pointer as E's attribute"
      }
    }
  },

  // AST CONSTRUCTION EXAMPLE
  {
    id: 22,
    section: "trees",
    type: "interactive",
    title: "AST Construction for (1 + 3) * 2",
    content: {
      expression: "(1 + 3) * 2",
      description: "Watch the AST being built bottom-up:"
    },
    interactive: { type: "ast-construction" }
  },

  // TREE GRAMMAR
  {
    id: 23,
    section: "trees",
    type: "concept",
    title: "Tree Grammars",
    content: {
      description: "Grammars that describe valid syntax tree structures:",
      items: [
        { icon: "📐", text: "Purpose", detail: "Define what AST structures are valid" },
        { icon: "🔍", text: "Traversal", detail: "Guide semantic analysis tree walks" },
        { icon: "✅", text: "Validation", detail: "Ensure AST was built correctly" },
        { icon: "🎯", text: "Code Gen", detail: "Pattern matching for instruction selection" }
      ],
      example: {
        rule: "expr → PLUS(expr, expr) | TIMES(expr, expr) | INT",
        explanation: "AST node can be +, *, or integer leaf"
      }
    }
  },

  // PRACTICAL SEMANTIC ANALYSIS
  {
    id: 24,
    section: "practical",
    type: "concept",
    title: "Practical Semantic Analysis Tasks",
    content: {
      description: "What compilers actually check during semantic analysis:",
      items: [
        { icon: "🔤", text: "Declaration Checking", detail: "Variables declared before use" },
        { icon: "📊", text: "Type Checking", detail: "Operators applied to compatible types" },
        { icon: "🔢", text: "Type Coercion", detail: "Insert conversions (int → float)" },
        { icon: "📍", text: "Scope Resolution", detail: "Match uses to declarations" },
        { icon: "⚖️", text: "Uniqueness Checks", detail: "No duplicate declarations in same scope" },
        { icon: "🔗", text: "Flow Analysis", detail: "Return statements, initialization" }
      ]
    }
  },

  // SYMBOL TABLE
  {
    id: 25,
    section: "practical",
    type: "concept",
    title: "Symbol Table",
    content: {
      description: "Central data structure for semantic analysis:",
      items: [
        { icon: "📖", text: "Contents", detail: "Names, types, scopes, memory locations" },
        { icon: "🔍", text: "Operations", detail: "Insert, lookup, enter/exit scope" },
        { icon: "📚", text: "Structure", detail: "Often stack of hash tables (per scope)" },
        { icon: "🔗", text: "Inherited Attribute", detail: "Passed down as environment (env)" }
      ],
      example: {
        code: "int x; float y; { int x; ... }",
        explanation: "Inner x shadows outer x in nested scope table"
      }
    },
    interactive: { type: "symbol-table" }
  },

  // SUMMARY
  {
    id: 26,
    section: "summary",
    type: "summary",
    title: "Chapter 4 Summary",
    content: {
      sections: [
        {
          title: "Attribute Grammars",
          points: [
            "Formal framework for tree decoration",
            "Synthesized: bottom-up (children → parent)",
            "Inherited: top-down/left-right (context)",
            "Semantic rules define attribute relationships"
          ]
        },
        {
          title: "Grammar Classes",
          points: [
            "S-Attributed: synthesized only, LR-friendly",
            "L-Attributed: left-to-right eval, LL-friendly",
            "L-attributed is most practical for real compilers"
          ]
        },
        {
          title: "Trees and Actions",
          points: [
            "Parse tree: complete derivation, verbose",
            "Syntax tree (AST): abstract, compact",
            "Action routines: code at grammar positions",
            "Symbol table: tracks declarations and types"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

const AttributeFlowDemo = () => {
  const [attrType, setAttrType] = useState('synthesized');
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Attribute Flow</div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setAttrType('synthesized')}
          className={`px-4 py-2 rounded ${attrType === 'synthesized' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Synthesized (↑)
        </button>
        <button onClick={() => setAttrType('inherited')}
          className={`px-4 py-2 rounded ${attrType === 'inherited' ? 'bg-purple-500 text-white' : 'bg-slate-700'}`}>
          Inherited (↓)
        </button>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-lg">
        {/* Simple tree visualization */}
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${
            attrType === 'synthesized' ? 'border-blue-500 bg-blue-500/20' : 'border-purple-500 bg-purple-500/20'
          }`}>E</div>
          
          <div className={`w-1 h-8 ${attrType === 'synthesized' ? 'bg-blue-500' : 'bg-purple-500'}`} />
          {attrType === 'synthesized' ? (
            <div className="text-blue-400 text-2xl">↑</div>
          ) : (
            <div className="text-purple-400 text-2xl">↓</div>
          )}
          <div className={`w-1 h-8 ${attrType === 'synthesized' ? 'bg-blue-500' : 'bg-purple-500'}`} />
          
          <div className="flex gap-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 ${
              attrType === 'synthesized' ? 'border-blue-500 bg-blue-500/20' : 'border-purple-500 bg-purple-500/20'
            }`}>E</div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 ${
              attrType === 'synthesized' ? 'border-blue-500 bg-blue-500/20' : 'border-purple-500 bg-purple-500/20'
            }`}>+</div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 ${
              attrType === 'synthesized' ? 'border-blue-500 bg-blue-500/20' : 'border-purple-500 bg-purple-500/20'
            }`}>T</div>
          </div>
        </div>
        
        <div className={`mt-6 p-6 rounded-lg ${attrType === 'synthesized' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
          {attrType === 'synthesized' ? (
            <div>
              <div className="font-bold text-blue-400 mb-2">Synthesized Attribute (val)</div>
              <div className="text-slate-300">E.val = E₁.val + T.val</div>
              <div className="text-slate-400 text-sm mt-2">Parent computes its value FROM children</div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-purple-400 mb-2">Inherited Attribute (env)</div>
              <div className="text-slate-300">E₁.env = E.env; T.env = E.env</div>
              <div className="text-slate-400 text-sm mt-2">Children receive context FROM parent</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TreeEvaluation = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { desc: "Start with expression (1 + 3) * 2", tree: "E", values: {} },
    { desc: "Parse: F → 1 (leaf)", tree: "const 1", values: { "F₁": 1 } },
    { desc: "T → F: T.val = F.val", tree: "T₁", values: { "F₁": 1, "T₁": 1 } },
    { desc: "E → T: E.val = T.val", tree: "E₁", values: { "F₁": 1, "T₁": 1, "E₁": 1 } },
    { desc: "Parse: F → 3 (leaf)", tree: "const 3", values: { "F₁": 1, "T₁": 1, "E₁": 1, "F₂": 3 } },
    { desc: "T → F: T.val = F.val", tree: "T₂", values: { "F₁": 1, "T₁": 1, "E₁": 1, "F₂": 3, "T₂": 3 } },
    { desc: "E → E + T: E.val = 1 + 3", tree: "E₂", values: { "F₁": 1, "T₁": 1, "E₁": 1, "F₂": 3, "T₂": 3, "E₂": 4 } },
    { desc: "F → (E): F.val = E.val", tree: "F₃", values: { "E₂": 4, "F₃": 4 } },
    { desc: "T → F: T.val = F.val", tree: "T₃", values: { "F₃": 4, "T₃": 4 } },
    { desc: "Parse: F → 2 (leaf)", tree: "const 2", values: { "T₃": 4, "F₄": 2 } },
    { desc: "T → T * F: T.val = 4 * 2", tree: "T₄", values: { "T₃": 4, "F₄": 2, "T₄": 8 } },
    { desc: "E → T: E.val = T.val = 8 ✓", tree: "E (root)", values: { "T₄": 8, "E": 8 } }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Evaluating (1 + 3) * 2</div>
      
      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <div className="text-slate-500 text-sm mb-1">Step {step + 1}/{steps.length}</div>
        <div className="text-white text-2xl">{current.desc}</div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-4">
        <div className="bg-slate-900 p-6 rounded-lg">
          <div className="text-slate-500 text-sm mb-2">Current Focus</div>
          <div className="text-2xl font-mono text-emerald-400">{current.tree}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-lg">
          <div className="text-slate-500 text-sm mb-2">Computed Values</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(current.values).map(([k, v]) => (
              <span key={k} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm font-mono">
                {k}={v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {step === steps.length - 1 && (
        <div className="bg-emerald-500/20 border border-emerald-500 p-6 rounded-lg mb-4 text-center">
          <div className="text-emerald-400 text-2xl font-bold">Result: 8</div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-emerald-600 rounded text-base">Reset</button>
      </div>
    </div>
  );
};

const AttributeStackDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { action: "Shift 3", parseStack: ["3"], attrStack: [3], input: "+ 4 * 2" },
    { action: "Reduce F → const", parseStack: ["F"], attrStack: [3], input: "+ 4 * 2" },
    { action: "Reduce T → F", parseStack: ["T"], attrStack: [3], input: "+ 4 * 2" },
    { action: "Reduce E → T", parseStack: ["E"], attrStack: [3], input: "+ 4 * 2" },
    { action: "Shift +", parseStack: ["E", "+"], attrStack: [3], input: "4 * 2" },
    { action: "Shift 4", parseStack: ["E", "+", "4"], attrStack: [3, 4], input: "* 2" },
    { action: "Reduce F → const", parseStack: ["E", "+", "F"], attrStack: [3, 4], input: "* 2" },
    { action: "Reduce T → F", parseStack: ["E", "+", "T"], attrStack: [3, 4], input: "* 2" },
    { action: "Shift *", parseStack: ["E", "+", "T", "*"], attrStack: [3, 4], input: "2" },
    { action: "Shift 2", parseStack: ["E", "+", "T", "*", "2"], attrStack: [3, 4, 2], input: "" },
    { action: "Reduce F → const", parseStack: ["E", "+", "T", "*", "F"], attrStack: [3, 4, 2], input: "" },
    { action: "Reduce T → T * F (4*2=8)", parseStack: ["E", "+", "T"], attrStack: [3, 8], input: "" },
    { action: "Reduce E → E + T (3+8=11)", parseStack: ["E"], attrStack: [11], input: "" },
    { action: "Accept! Result: 11", parseStack: ["E"], attrStack: [11], input: "✓" }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Attribute Stack (parsing 3 + 4 * 2)</div>
      
      <div className="grid grid-cols-3 gap-5 mb-4">
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-500 text-sm mb-1">Parse Stack</div>
          <div className="font-mono text-white">{current.parseStack.join(' ')}</div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-500 text-sm mb-1">Attribute Stack</div>
          <div className="font-mono text-emerald-400">[{current.attrStack.join(', ')}]</div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-slate-500 text-sm mb-1">Remaining Input</div>
          <div className="font-mono text-amber-400">{current.input || "(empty)"}</div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <span className={`px-3 py-1 rounded text-sm font-bold ${
          current.action.includes('Shift') ? 'bg-blue-500 text-white' :
          current.action.includes('Reduce') ? 'bg-purple-500 text-white' :
          'bg-emerald-500 text-white'
        }`}>{current.action}</span>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-emerald-600 rounded text-base">Reset</button>
      </div>
    </div>
  );
};

const TreeComparisonDemo = () => {
  const [treeType, setTreeType] = useState('parse');
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Parse Tree vs AST for (1 + 3) * 2</div>
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTreeType('parse')}
          className={`px-4 py-2 rounded ${treeType === 'parse' ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}>
          Parse Tree
        </button>
        <button onClick={() => setTreeType('ast')}
          className={`px-4 py-2 rounded ${treeType === 'ast' ? 'bg-emerald-500 text-white' : 'bg-slate-700'}`}>
          Syntax Tree (AST)
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        {treeType === 'parse' ? (
          <div className="text-center">
            <div className="text-orange-400 font-bold mb-4">Parse Tree (Verbose)</div>
            <pre className="text-slate-300 text-sm text-left inline-block">{`         E
         |
         T
        /|\\
       T * F
       |   |
       F   2
       |
      (E)
      /|\\
     E + T
     |   |
     T   F
     |   |
     F   3
     |
     1`}</pre>
            <div className="mt-4 text-slate-400 text-sm">11 nodes - includes all grammar symbols</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-emerald-400 font-bold mb-4">Abstract Syntax Tree (Compact)</div>
            <pre className="text-slate-300 text-sm text-left inline-block">{`      *
     / \\
    +   2
   / \\
  1   3`}</pre>
            <div className="mt-4 text-slate-400 text-sm">5 nodes - only operators and operands</div>
          </div>
        )}
      </div>

      <div className={`mt-4 p-6 rounded-lg ${treeType === 'parse' ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}>
        {treeType === 'parse' ? (
          <div className="text-orange-400">
            <strong>Parse Tree:</strong> Shows complete derivation, matches grammar exactly, useful for debugging
          </div>
        ) : (
          <div className="text-emerald-400">
            <strong>AST:</strong> Abstract structure, no punctuation nodes, ready for semantic analysis
          </div>
        )}
      </div>
    </div>
  );
};

const ASTConstructionDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { desc: "Create leaf node for 1", ast: "1", nodes: ["1"] },
    { desc: "Create leaf node for 3", ast: "1  3", nodes: ["1", "3"] },
    { desc: "Create + node with children 1, 3", ast: "  +\n / \\\n1   3", nodes: ["+", "1", "3"] },
    { desc: "Create leaf node for 2", ast: "  +     2\n / \\\n1   3", nodes: ["+", "1", "3", "2"] },
    { desc: "Create * node with children +, 2", ast: "    *\n   / \\\n  +   2\n / \\\n1   3", nodes: ["*", "+", "1", "3", "2"] }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Building AST for (1 + 3) * 2</div>
      
      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <div className="text-slate-500 text-sm mb-1">Step {step + 1}: {current.desc}</div>
        <pre className="text-emerald-400 font-mono text-xl mt-4 text-center">{current.ast}</pre>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <div className="text-slate-500 text-sm mb-2">Nodes created:</div>
        <div className="flex gap-2 flex-wrap">
          {current.nodes.map((n, i) => (
            <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded font-mono">{n}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-emerald-600 rounded text-base">Reset</button>
      </div>
    </div>
  );
};

// Interactive Parse Tree Visualization
const ParseTreeVisualization = () => {
  const [step, setStep] = useState(0);
  const [showValues, setShowValues] = useState(true);
  
  // Tree node component
  const TreeNode = ({ label, value, children, highlight, x, y, parentX, parentY }) => {
    const nodeWidth = 50;
    const nodeHeight = 40;
    
    return (
      <g>
        {/* Line to parent */}
        {parentX !== undefined && parentY !== undefined && (
          <line
            x1={parentX}
            y1={parentY + nodeHeight/2}
            x2={x}
            y2={y - nodeHeight/2}
            stroke={highlight ? "#10b981" : "#475569"}
            strokeWidth={2}
          />
        )}
        {/* Node circle/rect */}
        <rect
          x={x - nodeWidth/2}
          y={y - nodeHeight/2}
          width={nodeWidth}
          height={nodeHeight}
          rx={8}
          fill={highlight ? "#10b981" : "#1e293b"}
          stroke={highlight ? "#34d399" : "#475569"}
          strokeWidth={2}
        />
        {/* Label */}
        <text
          x={x}
          y={y - 5}
          textAnchor="middle"
          fill="white"
          fontSize={14}
          fontWeight="bold"
        >
          {label}
        </text>
        {/* Value */}
        {showValues && value !== undefined && (
          <text
            x={x}
            y={y + 12}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize={11}
            fontFamily="monospace"
          >
            ={value}
          </text>
        )}
      </g>
    );
  };

  const steps = [
    {
      desc: "Start: Parse the expression (1 + 3) * 2",
      nodes: [],
      highlight: []
    },
    {
      desc: "Scan '1' → Create leaf node F with value 1",
      nodes: [
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280 }
      ],
      highlight: ['f1']
    },
    {
      desc: "Reduce: T → F, propagate value up",
      nodes: [
        { id: 't1', label: 'T', value: 1, x: 150, y: 220 },
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280, parent: 't1' }
      ],
      highlight: ['t1']
    },
    {
      desc: "Reduce: E → T, propagate value up",
      nodes: [
        { id: 'e1', label: 'E', value: 1, x: 150, y: 160 },
        { id: 't1', label: 'T', value: 1, x: 150, y: 220, parent: 'e1' },
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280, parent: 't1' }
      ],
      highlight: ['e1']
    },
    {
      desc: "Scan '3' → Create leaf node F with value 3",
      nodes: [
        { id: 'e1', label: 'E', value: 1, x: 150, y: 160 },
        { id: 't1', label: 'T', value: 1, x: 150, y: 220, parent: 'e1' },
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280, parent: 't1' },
        { id: 'f2', label: 'F', value: 3, x: 280, y: 280 }
      ],
      highlight: ['f2']
    },
    {
      desc: "Reduce: T → F, propagate value",
      nodes: [
        { id: 'e1', label: 'E', value: 1, x: 150, y: 160 },
        { id: 't1', label: 'T', value: 1, x: 150, y: 220, parent: 'e1' },
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280, parent: 't1' },
        { id: 't2', label: 'T', value: 3, x: 280, y: 220 },
        { id: 'f2', label: 'F', value: 3, x: 280, y: 280, parent: 't2' }
      ],
      highlight: ['t2']
    },
    {
      desc: "Reduce: E → E + T, compute 1 + 3 = 4",
      nodes: [
        { id: 'e2', label: 'E', value: 4, x: 215, y: 100 },
        { id: 'e1', label: 'E', value: 1, x: 150, y: 160, parent: 'e2' },
        { id: 'plus', label: '+', x: 215, y: 160, parent: 'e2' },
        { id: 't2', label: 'T', value: 3, x: 280, y: 160, parent: 'e2' },
        { id: 't1', label: 'T', value: 1, x: 150, y: 220, parent: 'e1' },
        { id: 'f1', label: 'F', value: 1, x: 150, y: 280, parent: 't1' },
        { id: 'f2', label: 'F', value: 3, x: 280, y: 280, parent: 't2' }
      ],
      highlight: ['e2', 'plus']
    },
    {
      desc: "F → (E), parenthesized expression has value 4",
      nodes: [
        { id: 'f3', label: 'F', value: 4, x: 215, y: 100 },
        { id: 'lp', label: '(', x: 140, y: 160, parent: 'f3' },
        { id: 'e2', label: 'E', value: 4, x: 215, y: 160, parent: 'f3' },
        { id: 'rp', label: ')', x: 290, y: 160, parent: 'f3' },
      ],
      highlight: ['f3']
    },
    {
      desc: "Reduce: T → F, propagate value 4",
      nodes: [
        { id: 't3', label: 'T', value: 4, x: 200, y: 100 },
        { id: 'f3', label: 'F', value: 4, x: 200, y: 160, parent: 't3' },
      ],
      highlight: ['t3']
    },
    {
      desc: "Scan '2' → Create leaf node F with value 2",
      nodes: [
        { id: 't3', label: 'T', value: 4, x: 180, y: 100 },
        { id: 'f3', label: 'F', value: 4, x: 180, y: 160, parent: 't3' },
        { id: 'f4', label: 'F', value: 2, x: 320, y: 160 }
      ],
      highlight: ['f4']
    },
    {
      desc: "Reduce: T → T * F, compute 4 * 2 = 8",
      nodes: [
        { id: 't4', label: 'T', value: 8, x: 250, y: 60 },
        { id: 't3', label: 'T', value: 4, x: 160, y: 130, parent: 't4' },
        { id: 'mult', label: '*', x: 250, y: 130, parent: 't4' },
        { id: 'f4', label: 'F', value: 2, x: 340, y: 130, parent: 't4' },
        { id: 'f3', label: 'F', value: 4, x: 160, y: 200, parent: 't3' },
      ],
      highlight: ['t4', 'mult']
    },
    {
      desc: "Reduce: E → T, final result = 8 ✓",
      nodes: [
        { id: 'eroot', label: 'E', value: 8, x: 250, y: 30 },
        { id: 't4', label: 'T', value: 8, x: 250, y: 90, parent: 'eroot' },
        { id: 't3', label: 'T', value: 4, x: 150, y: 160, parent: 't4' },
        { id: 'mult', label: '*', x: 250, y: 160, parent: 't4' },
        { id: 'f4', label: 'F', value: 2, x: 350, y: 160, parent: 't4' },
        { id: 'f3', label: 'F', value: 4, x: 150, y: 230, parent: 't3' },
      ],
      highlight: ['eroot']
    }
  ];

  const current = steps[step];
  
  // Build parent lookup
  const parentLookup = {};
  current.nodes.forEach(n => {
    if (n.parent) {
      const parent = current.nodes.find(p => p.id === n.parent);
      if (parent) {
        parentLookup[n.id] = { x: parent.x, y: parent.y };
      }
    }
  });

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Parse Tree Construction for (1 + 3) * 2</div>
      
      <div className="flex items-center gap-5 mb-4">
        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input 
            type="checkbox" 
            checked={showValues} 
            onChange={(e) => setShowValues(e.target.checked)}
            className="rounded"
          />
          Show attribute values
        </label>
      </div>

      {/* SVG Tree Visualization */}
      <div className="bg-slate-900 rounded-lg p-4 mb-4">
        <svg width="100%" height="320" viewBox="0 0 500 320">
          {/* Render nodes */}
          {current.nodes.map(node => (
            <TreeNode
              key={node.id}
              label={node.label}
              value={showValues ? node.value : undefined}
              x={node.x}
              y={node.y}
              parentX={parentLookup[node.id]?.x}
              parentY={parentLookup[node.id]?.y}
              highlight={current.highlight.includes(node.id)}
            />
          ))}
          
          {/* Empty state */}
          {current.nodes.length === 0 && (
            <text x="250" y="160" textAnchor="middle" fill="#64748b" fontSize={16}>
              Click "Next" to start building the tree
            </text>
          )}
        </svg>
      </div>

      {/* Description */}
      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">Step {step + 1}/{steps.length}:</span>
          <span className="text-white">{current.desc}</span>
        </div>
      </div>

      {/* Result highlight */}
      {step === steps.length - 1 && (
        <div className="bg-emerald-500/20 border border-emerald-500 p-6 rounded-lg mb-4 text-center">
          <div className="text-emerald-400 text-2xl font-bold">(1 + 3) * 2 = 8</div>
          <div className="text-slate-400 text-sm mt-1">Synthesized attributes propagated from leaves to root</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button 
          onClick={() => setStep(0)} 
          className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
        >
          ⏮ Start
        </button>
        <button 
          onClick={() => setStep(Math.max(0, step - 1))} 
          disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50 hover:bg-slate-600"
        >
          ← Prev
        </button>
        <button 
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50 hover:bg-slate-600"
        >
          Next →
        </button>
        <button 
          onClick={() => setStep(steps.length - 1)} 
          className="px-5 py-2 bg-emerald-600 rounded text-base hover:bg-emerald-500"
        >
          ⏭ End
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 justify-center mt-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === step ? 'bg-emerald-500 w-4' : i < step ? 'bg-emerald-500/50' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Interactive AST vs Parse Tree Side by Side
const ASTvsParseTree = () => {
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState('both'); // 'parse', 'ast', 'both'

  const TreeNodeSVG = ({ label, value, x, y, parentX, parentY, isAST, highlight }) => {
    const size = isAST ? 36 : 30;
    return (
      <g>
        {parentX !== undefined && (
          <line
            x1={parentX} y1={parentY + size/2}
            x2={x} y2={y - size/2}
            stroke={highlight ? "#10b981" : "#475569"}
            strokeWidth={1.5}
          />
        )}
        <circle
          cx={x} cy={y}
          r={size/2}
          fill={highlight ? "#10b981" : isAST ? "#3b82f6" : "#1e293b"}
          stroke={highlight ? "#34d399" : isAST ? "#60a5fa" : "#475569"}
          strokeWidth={2}
        />
        <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize={isAST ? 14 : 11} fontWeight="bold">
          {label}
        </text>
        {value !== undefined && (
          <text x={x} y={y + size/2 + 12} textAnchor="middle" fill="#fbbf24" fontSize={9}>
            {value}
          </text>
        )}
      </g>
    );
  };

  // Parse tree structure (verbose)
  const parseTreeNodes = [
    { id: 'e0', label: 'E', x: 150, y: 30 },
    { id: 't0', label: 'T', x: 150, y: 70, parent: 'e0' },
    { id: 't1', label: 'T', x: 90, y: 110, parent: 't0' },
    { id: 'star', label: '*', x: 150, y: 110, parent: 't0' },
    { id: 'f0', label: 'F', x: 210, y: 110, parent: 't0' },
    { id: 'f1', label: 'F', x: 90, y: 150, parent: 't1' },
    { id: 'two', label: '2', x: 210, y: 150, parent: 'f0' },
    { id: 'lp', label: '(', x: 50, y: 190, parent: 'f1' },
    { id: 'e1', label: 'E', x: 90, y: 190, parent: 'f1' },
    { id: 'rp', label: ')', x: 130, y: 190, parent: 'f1' },
    { id: 'e2', label: 'E', x: 60, y: 230, parent: 'e1' },
    { id: 'plus', label: '+', x: 90, y: 230, parent: 'e1' },
    { id: 't2', label: 'T', x: 120, y: 230, parent: 'e1' },
    { id: 't3', label: 'T', x: 60, y: 270, parent: 'e2' },
    { id: 'f2', label: 'F', x: 120, y: 270, parent: 't2' },
    { id: 'f3', label: 'F', x: 60, y: 310, parent: 't3' },
    { id: 'three', label: '3', x: 120, y: 310, parent: 'f2' },
    { id: 'one', label: '1', x: 60, y: 350, parent: 'f3' },
  ];

  // AST structure (compact)
  const astNodes = [
    { id: 'mult', label: '*', value: 8, x: 150, y: 60 },
    { id: 'plus', label: '+', value: 4, x: 90, y: 140, parent: 'mult' },
    { id: 'two', label: '2', value: 2, x: 210, y: 140, parent: 'mult' },
    { id: 'one', label: '1', value: 1, x: 50, y: 220, parent: 'plus' },
    { id: 'three', label: '3', value: 3, x: 130, y: 220, parent: 'plus' },
  ];

  const buildParentLookup = (nodes) => {
    const lookup = {};
    nodes.forEach(n => {
      if (n.parent) {
        const parent = nodes.find(p => p.id === n.parent);
        if (parent) lookup[n.id] = { x: parent.x, y: parent.y };
      }
    });
    return lookup;
  };

  const parseParents = buildParentLookup(parseTreeNodes);
  const astParents = buildParentLookup(astNodes);

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Parse Tree vs AST for (1 + 3) * 2</div>
      
      <div className="flex gap-2 mb-4 justify-center">
        <button onClick={() => setViewMode('parse')}
          className={`px-4 py-2 rounded ${viewMode === 'parse' ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}>
          Parse Tree Only
        </button>
        <button onClick={() => setViewMode('both')}
          className={`px-4 py-2 rounded ${viewMode === 'both' ? 'bg-purple-500 text-white' : 'bg-slate-700'}`}>
          Side by Side
        </button>
        <button onClick={() => setViewMode('ast')}
          className={`px-4 py-2 rounded ${viewMode === 'ast' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          AST Only
        </button>
      </div>

      <div className={`grid gap-5 ${viewMode === 'both' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Parse Tree */}
        {(viewMode === 'parse' || viewMode === 'both') && (
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-orange-400 font-bold text-center mb-2">Parse Tree</div>
            <div className="text-slate-500 text-sm text-center mb-2">18 nodes (verbose)</div>
            <svg width="100%" height="380" viewBox="0 0 300 380">
              {parseTreeNodes.map(node => (
                <TreeNodeSVG
                  key={node.id}
                  label={node.label}
                  x={node.x}
                  y={node.y}
                  parentX={parseParents[node.id]?.x}
                  parentY={parseParents[node.id]?.y}
                  isAST={false}
                />
              ))}
            </svg>
          </div>
        )}

        {/* AST */}
        {(viewMode === 'ast' || viewMode === 'both') && (
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-blue-400 font-bold text-center mb-2">Abstract Syntax Tree</div>
            <div className="text-slate-500 text-sm text-center mb-2">5 nodes (compact)</div>
            <svg width="100%" height="280" viewBox="0 0 300 280">
              {astNodes.map(node => (
                <TreeNodeSVG
                  key={node.id}
                  label={node.label}
                  value={node.value}
                  x={node.x}
                  y={node.y}
                  parentX={astParents[node.id]?.x}
                  parentY={astParents[node.id]?.y}
                  isAST={true}
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Comparison stats */}
      <div className="grid grid-cols-2 gap-5 mt-4">
        <div className="bg-orange-500/20 p-3 rounded-lg text-center">
          <div className="text-orange-400 font-bold">Parse Tree</div>
          <div className="text-2xl text-white">18 nodes</div>
          <div className="text-slate-400 text-sm">All grammar symbols</div>
        </div>
        <div className="bg-blue-500/20 p-3 rounded-lg text-center">
          <div className="text-blue-400 font-bold">AST</div>
          <div className="text-2xl text-white">5 nodes</div>
          <div className="text-slate-400 text-sm">Only meaningful nodes</div>
        </div>
      </div>
    </div>
  );
};

const SymbolTableDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { code: "int x;", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }] }], action: "Declare x in global scope" },
    { code: "float y;", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }], action: "Declare y in global scope" },
    { code: "{", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }, { level: 1, symbols: [] }], action: "Enter new scope (block)" },
    { code: "int x;", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }, { level: 1, symbols: [{ name: "x", type: "int", shadows: true }] }], action: "Declare x in inner scope (shadows outer x)" },
    { code: "x = 5;", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }, { level: 1, symbols: [{ name: "x", type: "int", shadows: true }] }], action: "Lookup x → finds inner x (int)" },
    { code: "}", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }], action: "Exit scope, inner x destroyed" },
    { code: "x = 10;", scopes: [{ level: 0, symbols: [{ name: "x", type: "int" }, { name: "y", type: "float" }] }], action: "Lookup x → finds global x (int)" }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-emerald-400 text-base mb-4 font-mono">Interactive: Symbol Table</div>
      
      <div className="grid grid-cols-2 gap-5 mb-4">
        <div className="bg-slate-900 p-6 rounded-lg">
          <div className="text-slate-500 text-sm mb-2">Current Code</div>
          <div className="font-mono text-xl text-white">{current.code}</div>
          <div className="text-emerald-400 text-sm mt-2">{current.action}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-lg">
          <div className="text-slate-500 text-sm mb-2">Symbol Table (Stack of Scopes)</div>
          {current.scopes.map((scope, i) => (
            <div key={i} className={`p-2 rounded mb-1 ${i === current.scopes.length - 1 ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-800'}`}>
              <div className="text-xs text-slate-400">Scope {scope.level}</div>
              {scope.symbols.length === 0 ? (
                <div className="text-slate-500 text-sm">(empty)</div>
              ) : (
                scope.symbols.map((sym, j) => (
                  <div key={j} className={`text-sm font-mono ${sym.shadows ? 'text-amber-400' : 'text-white'}`}>
                    {sym.name}: {sym.type} {sym.shadows && "(shadows)"}
                  </div>
                ))
              )}
            </div>
          )).reverse()}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-emerald-600 rounded text-base">Reset</button>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-6xl mb-8">🌳</div>
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-xl text-emerald-400 mb-8">{slide.content.subtitle}</h2>}
    <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl">
      {slide.content.topics?.map((t, i) => (
        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">{t}</span>
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
          <div key={i} className="bg-slate-800/50 p-6 rounded-lg flex items-start gap-3">
            {item.icon && <span className="text-5xl">{item.icon}</span>}
            <div>
              <p className="text-white font-medium text-2xl">{item.text}</p>
              {item.detail && <p className="text-slate-300 text-xl mt-1">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    )}
    {slide.content.note && <p className="mt-4 text-emerald-400 italic">{slide.content.note}</p>}
    {slide.content.example && (
      <div className="mt-4 bg-slate-900 p-6 rounded-lg">
        {slide.content.example.production && <div className="text-slate-400 mb-1">Production: <code className="text-emerald-400">{slide.content.example.production}</code></div>}
        {slide.content.example.rule && <div className="text-slate-400 mb-1">Rule: <code className="text-emerald-400">{slide.content.example.rule}</code></div>}
        {slide.content.example.action && <div className="text-slate-400 mb-1">Action: <code className="text-emerald-400">{slide.content.example.action}</code></div>}
        {slide.content.example.computation && <div className="text-slate-400 mb-1">Computation: <code className="text-emerald-400">{slide.content.example.computation}</code></div>}
        {slide.content.example.code && <pre className="text-emerald-400 font-mono text-sm">{slide.content.example.code}</pre>}
        <p className="text-slate-400 text-sm mt-2">{slide.content.example.explanation}</p>
      </div>
    )}
    {slide.interactive?.type === 'symbol-table' && <SymbolTableDemo />}
  </div>
);

const DiagramSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.phases && (
      <div className="space-y-2">
        {slide.content.phases.map((phase, i) => (
          <div key={i} className={`flex items-center gap-5 p-3 rounded-lg ${
            phase.current ? 'bg-emerald-500/20 border-2 border-emerald-500' : 
            phase.done ? 'bg-slate-800/50' : 'bg-slate-800/30'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              phase.current ? 'bg-emerald-500 text-white' :
              phase.done ? 'bg-green-600 text-white' : 'bg-slate-600'
            }`}>{i + 1}</div>
            <div className="flex-1">
              <div className={`font-bold ${phase.current ? 'text-emerald-400' : 'text-white'}`}>{phase.name}</div>
            </div>
            <div className="text-slate-400 font-mono text-sm">→ {phase.output}</div>
          </div>
        ))}
      </div>
    )}
    {slide.content.note && <p className="mt-4 text-slate-400 italic">{slide.content.note}</p>}
  </div>
);

const DefinitionSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.definition && <p className="text-3xl text-slate-300 mb-8">{slide.content.definition}</p>}
    <div className="space-y-5">
      {slide.content.items?.map((item, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-lg border-l-4 border-emerald-500">
          <div className="flex items-start gap-5">
            <span className="text-emerald-400 font-bold">{item.term}</span>
            <div className="flex-1">
              <p className="text-white">{item.definition}</p>
              {item.example && <p className="text-slate-400 font-mono text-sm mt-2">Example: {item.example}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
    {slide.content.note && <p className="mt-4 text-slate-400 italic">{slide.content.note}</p>}
  </div>
);

const GrammarSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-2">{slide.title}</h2>
    {slide.content.title && <p className="text-slate-400 mb-8">{slide.content.title}</p>}
    <div className="bg-slate-800 p-6 rounded-lg font-mono mb-8">
      {slide.content.productions?.map((prod, i) => (
        <div key={i} className="text-emerald-400 py-2 text-xl hover:bg-slate-700/50 px-2 rounded">{prod}</div>
      ))}
    </div>
    {slide.content.note && <p className="text-slate-400 italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'attribute-grammar' && <TreeEvaluation />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.approaches && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slide.content.approaches.map((a, i) => (
          <div key={i} className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-emerald-400 font-bold mb-3">{a.name}</h3>
            {a.pros && (
              <div className="mb-2">
                <p className="text-green-400 text-xs mb-1">✓ Pros</p>
                <ul className="text-slate-300 text-sm">{a.pros.map((p, j) => <li key={j}>• {p}</li>)}</ul>
              </div>
            )}
            {a.cons && (
              <div className="mb-2">
                <p className="text-red-400 text-xs mb-1">✗ Cons</p>
                <ul className="text-slate-400 text-sm">{a.cons.map((c, j) => <li key={j}>• {c}</li>)}</ul>
              </div>
            )}
            {a.example && <p className="text-slate-500 text-sm mt-2">Example: {a.example}</p>}
            {a.attributes && <p className="text-emerald-400 text-xs mt-2">Attributes: {a.attributes}</p>}
          </div>
        ))}
      </div>
    )}
    {slide.content.insight && (
      <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-center">
        <p className="text-emerald-400 font-bold">{slide.content.insight}</p>
      </div>
    )}
    {slide.interactive?.type === 'tree-comparison' && <TreeComparisonDemo />}
  </div>
);

const InteractiveSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.content.description && <p className="text-slate-300 mb-4">{slide.content.description}</p>}
    {slide.content.expression && (
      <div className="bg-slate-900 p-6 rounded-lg mb-4 text-center">
        <span className="text-2xl font-mono text-emerald-400">{slide.content.expression}</span>
        {slide.content.expectedResult && <span className="text-slate-400 ml-4">= {slide.content.expectedResult}</span>}
      </div>
    )}
    {slide.interactive?.type === 'attribute-flow' && <AttributeFlowDemo />}
    {slide.interactive?.type === 'tree-evaluation' && <TreeEvaluation />}
    {slide.interactive?.type === 'parse-tree-visual' && <ParseTreeVisualization />}
    {slide.interactive?.type === 'ast-vs-parse' && <ASTvsParseTree />}
    {slide.interactive?.type === 'attribute-stack' && <AttributeStackDemo />}
    {slide.interactive?.type === 'ast-construction' && <ASTConstructionDemo />}
  </div>
);

const CodeSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="bg-slate-900 p-6 rounded-lg mb-8">
      <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">{slide.content.code}</pre>
    </div>
    {slide.content.explanation && (
      <div className="space-y-2">
        {slide.content.explanation.map((ex, i) => (
          <div key={i} className="flex gap-5 bg-slate-800/50 p-3 rounded">
            <span className="text-emerald-400 font-mono min-w-24">{ex.label}</span>
            <span className="text-slate-300">{ex.meaning}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TableSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {slide.content.headers.map((h, i) => (
              <th key={i} className="text-left p-3 text-emerald-400 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.content.rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800">
              {row.map((cell, j) => (
                <td key={j} className={`p-3 ${j === 0 ? 'text-white font-medium' : 'text-slate-300'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-emerald-400 font-bold text-2xl mb-4">{section.title}</h3>
          <ul className="space-y-2">
            {section.points.map((point, j) => (
              <li key={j} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
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
    case 'diagram': return <DiagramSlide slide={slide} />;
    case 'definition': return <DefinitionSlide slide={slide} />;
    case 'grammar': return <GrammarSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'interactive': return <InteractiveSlide slide={slide} />;
    case 'code': return <CodeSlide slide={slide} />;
    case 'table': return <TableSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter4Slides({ onBackToChapters }) {
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
          <div className="flex items-center gap-5">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-700 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-emerald-400 font-bold">Ch 4: {CHAPTER_CONFIG.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">{currentSlide + 1} / {SLIDES.length}</span>
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
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">{slide.section}</span>
          </div>
        </div>
      </header>

      {/* Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 p-4 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Chapter 4 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-emerald-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-emerald-500 text-white' : 'hover:bg-slate-700'
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
      <main className="pt-14 pb-16 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <SlideRenderer slide={slide} />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))} disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded disabled:opacity-30">
            ← Previous
          </button>
          <div className="flex-1 mx-8">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 rounded text-base disabled:opacity-30">
            Next →
          </button>
        </div>
        <div className="text-center text-slate-500 text-sm pb-2">
          <kbd className="px-1 bg-slate-700 rounded">←</kbd> <kbd className="px-1 bg-slate-700 rounded">→</kbd> navigate • <kbd className="px-1 bg-slate-700 rounded">M</kbd> menu
          <p className="mt-1">&copy; {new Date().getFullYear()} Dr. Qi Li. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

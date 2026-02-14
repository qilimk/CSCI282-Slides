import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 6: CONTROL FLOW
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 6,
  title: "Control Flow",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#ec4899" // pink
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
    title: "Chapter 6: Control Flow",
    content: {
      subtitle: "How Programs Execute",
      topics: [
        "Expression Evaluation",
        "Sequencing",
        "Selection (if/switch)",
        "Iteration (loops)",
        "Recursion",
        "Short-Circuit Evaluation"
      ]
    }
  },

  // CONTROL FLOW PARADIGMS
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Control Flow Paradigms",
    content: {
      description: "Basic paradigms for controlling program execution:",
      items: [
        { icon: "➡️", text: "Sequencing", detail: "Statements execute one after another" },
        { icon: "🔀", text: "Selection", detail: "Choose between alternatives (if, switch)" },
        { icon: "🔄", text: "Iteration", detail: "Repeat statements (for, while, do)" },
        { icon: "📦", text: "Procedural Abstraction", detail: "Subroutines, functions, methods" },
        { icon: "🔁", text: "Recursion", detail: "Functions that call themselves" },
        { icon: "⚡", text: "Concurrency", detail: "Parallel execution of code" }
      ]
    }
  },

  // EXPRESSION EVALUATION
  {
    id: 3,
    section: "expressions",
    type: "concept",
    title: "Expression Evaluation",
    content: {
      description: "How expressions are evaluated in programming languages:",
      items: [
        { icon: "📐", text: "Precedence", detail: "Which operators bind tighter (*, + vs +, *)" },
        { icon: "↔️", text: "Associativity", detail: "Left-to-right or right-to-left grouping" },
        { icon: "📋", text: "Order of Evaluation", detail: "Which operand is evaluated first" },
        { icon: "⚡", text: "Short-Circuiting", detail: "Skip evaluation when result is known" }
      ]
    }
  },

  // OPERATOR PRECEDENCE
  {
    id: 4,
    section: "expressions",
    type: "table",
    title: "Operator Precedence Levels",
    content: {
      description: "Number of precedence levels varies by language:",
      headers: ["Language", "Levels", "Notes"],
      rows: [
        ["C/C++", "15", "Too many to remember!"],
        ["Java", "15", "Similar to C"],
        ["Fortran", "8", "Reasonable"],
        ["Ada", "6", "Simple but AND/OR same level"],
        ["Pascal", "3", "Too few for good semantics"],
        ["Python", "~15", "Similar to C"]
      ],
      note: "Lesson: When in doubt, use parentheses!"
    }
  },

  // PRECEDENCE INTERACTIVE
  {
    id: 5,
    section: "expressions",
    type: "interactive",
    title: "Precedence in Action",
    content: {
      description: "See how precedence affects expression evaluation:"
    },
    interactive: { type: "precedence" }
  },

  // SHORT-CIRCUIT EVALUATION
  {
    id: 6,
    section: "expressions",
    type: "concept",
    title: "Short-Circuit Evaluation",
    content: {
      description: "Stop evaluating when the result is already determined:",
      items: [
        { icon: "&&", text: "AND short-circuit", detail: "If first is false, result is false (skip second)" },
        { icon: "||", text: "OR short-circuit", detail: "If first is true, result is true (skip second)" }
      ],
      examples: [
        { code: "if (b != 0 && a/b == c)", explanation: "Avoids division by zero" },
        { code: "if (ptr && ptr->value)", explanation: "Avoids null pointer dereference" },
        { code: "if (cached || expensive())", explanation: "Avoids expensive computation" }
      ]
    },
    interactive: { type: "short-circuit" }
  },

  // SIDE EFFECTS
  {
    id: 7,
    section: "expressions",
    type: "concept",
    title: "Side Effects",
    content: {
      description: "Changes to program state beyond returning a value:",
      items: [
        { icon: "📝", text: "Assignment", detail: "x = 5 changes the value of x" },
        { icon: "📤", text: "I/O Operations", detail: "print() outputs to screen" },
        { icon: "🌍", text: "Global State", detail: "Modifying global variables" },
        { icon: "⚠️", text: "Problem", detail: "Side effects in expressions can cause confusion" }
      ],
      note: "Side effects are FUNDAMENTAL to von Neumann computing, but can make code harder to reason about"
    }
  },

  // ASSIGNMENT
  {
    id: 8,
    section: "expressions",
    type: "concept",
    title: "Assignment Operators",
    content: {
      description: "Variations on assignment across languages:",
      items: [
        { icon: "=", text: "Simple Assignment", detail: "x = 5" },
        { icon: "+=", text: "Compound Assignment", detail: "x += 5 means x = x + 5" },
        { icon: "++", text: "Increment/Decrement", detail: "x++ or ++x (C-style)" },
        { icon: ":=", text: "Pascal-style", detail: "Distinguishes assignment from equality" }
      ],
      benefits: [
        "Compound operators: avoid redundant evaluation",
        "Increment: perform side effect exactly once",
        "Expression assignment: enables chaining (a = b = c = 0)"
      ]
    }
  },

  // SEQUENCING
  {
    id: 9,
    section: "sequencing",
    type: "concept",
    title: "Sequencing",
    content: {
      description: "The most basic control flow - statements execute in order:",
      items: [
        { icon: "1️⃣", text: "First Statement", detail: "Execute completely" },
        { icon: "2️⃣", text: "Second Statement", detail: "Then execute this" },
        { icon: "3️⃣", text: "Third Statement", detail: "And so on..." }
      ],
      note: "Very imperative, von Neumann style. The semicolon (;) is often the sequencing operator."
    }
  },

  // SELECTION - IF
  {
    id: 10,
    section: "selection",
    type: "concept",
    title: "Selection: If Statements",
    content: {
      description: "Choose between alternative paths:",
      items: [
        { icon: "❓", text: "Simple If", detail: "if (condition) statement" },
        { icon: "🔀", text: "If-Else", detail: "if (condition) stmt1 else stmt2" },
        { icon: "📋", text: "If-Elsif-Else", detail: "Chain of conditions" },
        { icon: "⚠️", text: "Dangling Else", detail: "Which if does else belong to?" }
      ]
    },
    interactive: { type: "if-else" }
  },

  // DANGLING ELSE
  {
    id: 11,
    section: "selection",
    type: "concept",
    title: "The Dangling Else Problem",
    content: {
      description: "Ambiguity in nested if statements:",
      code: `if (a)
  if (b)
    S1
  else      // Which 'if' does this belong to?
    S2`,
      items: [
        { icon: "📏", text: "Rule", detail: "Else matches nearest unmatched if" },
        { icon: "🔧", text: "Solution 1", detail: "Use braces/begin-end to be explicit" },
        { icon: "✨", text: "Solution 2", detail: "Use end markers (endif, fi, end if)" }
      ]
    }
  },

  // SELECTION - SWITCH/CASE
  {
    id: 12,
    section: "selection",
    type: "concept",
    title: "Selection: Switch/Case",
    content: {
      description: "Multi-way branch based on value:",
      items: [
        { icon: "🎯", text: "Purpose", detail: "Choose from many alternatives efficiently" },
        { icon: "⚡", text: "Implementation", detail: "Often uses jump table for O(1) dispatch" },
        { icon: "⬇️", text: "Fall-through", detail: "C/C++ continue to next case without break" },
        { icon: "🛡️", text: "Default", detail: "Handle unmatched cases" }
      ]
    },
    interactive: { type: "switch" }
  },

  // ITERATION OVERVIEW
  {
    id: 13,
    section: "iteration",
    type: "concept",
    title: "Iteration (Loops)",
    content: {
      description: "Repeat statements multiple times:",
      items: [
        { icon: "🔢", text: "Enumeration-controlled", detail: "for i = 1 to 10 (count iterations)" },
        { icon: "❓", text: "Logically-controlled", detail: "while (condition) (test before/after)" },
        { icon: "🔄", text: "Iterator-based", detail: "for item in collection" },
        { icon: "♾️", text: "Infinite loops", detail: "while(true) with break" }
      ]
    }
  },

  // FOR LOOPS
  {
    id: 14,
    section: "iteration",
    type: "concept",
    title: "For Loops",
    content: {
      description: "Enumeration-controlled iteration:",
      items: [
        { icon: "📊", text: "Loop Variable", detail: "Counter that changes each iteration" },
        { icon: "🎯", text: "Bounds", detail: "Start and end values" },
        { icon: "📏", text: "Step", detail: "How much to change each iteration" },
        { icon: "❓", text: "Questions", detail: "Can bounds change? Can variable be modified? Value after loop?" }
      ]
    },
    interactive: { type: "for-loop" }
  },

  // WHILE LOOPS
  {
    id: 15,
    section: "iteration",
    type: "comparison",
    title: "While vs Do-While",
    content: {
      approaches: [
        {
          name: "While (Pre-test)",
          code: "while (cond) {\n  body\n}",
          behavior: "Test BEFORE each iteration",
          minIterations: "0 times possible"
        },
        {
          name: "Do-While (Post-test)",
          code: "do {\n  body\n} while (cond);",
          behavior: "Test AFTER each iteration",
          minIterations: "At least 1 time"
        }
      ]
    },
    interactive: { type: "while-loops" }
  },

  // LOOP CONTROL
  {
    id: 16,
    section: "iteration",
    type: "concept",
    title: "Loop Control Statements",
    content: {
      description: "Alter normal loop execution:",
      items: [
        { icon: "🛑", text: "break", detail: "Exit the loop immediately" },
        { icon: "⏭️", text: "continue", detail: "Skip to next iteration" },
        { icon: "🏷️", text: "Labeled break", detail: "Exit outer loop (Java, JavaScript)" },
        { icon: "↩️", text: "return", detail: "Exit function (and loop)" }
      ]
    }
  },

  // RECURSION
  {
    id: 17,
    section: "recursion",
    type: "concept",
    title: "Recursion",
    content: {
      description: "Functions that call themselves:",
      items: [
        { icon: "🔁", text: "Self-Reference", detail: "Function calls itself with smaller input" },
        { icon: "🛑", text: "Base Case", detail: "Condition that stops recursion" },
        { icon: "📉", text: "Progress", detail: "Each call must move toward base case" },
        { icon: "📚", text: "Stack", detail: "Each call gets its own stack frame" }
      ],
      note: "Equally powerful to iteration - mechanical transformations exist between them"
    },
    interactive: { type: "recursion" }
  },

  // TAIL RECURSION
  {
    id: 18,
    section: "recursion",
    type: "concept",
    title: "Tail Recursion",
    content: {
      description: "Special form of recursion that can be optimized:",
      items: [
        { icon: "✨", text: "Definition", detail: "No computation after the recursive call" },
        { icon: "⚡", text: "Optimization", detail: "Can be converted to iteration (no stack growth)" },
        { icon: "🔄", text: "Tail Call", detail: "return f(...) is tail position" }
      ],
      code: `// Tail recursive GCD
int gcd(int a, int b) {
  if (a == b) return a;
  else if (a > b) return gcd(a-b, b);
  else return gcd(a, b-a);
}`
    },
    interactive: { type: "tail-recursion" }
  },

  // JUMP CODE / SHORT CIRCUIT CODE GEN
  {
    id: 19,
    section: "codegen",
    type: "comparison",
    title: "Code Generation: Short-Circuit",
    content: {
      description: "Comparing code with and without short-circuit evaluation:",
      approaches: [
        {
          name: "Without Short-Circuit",
          characteristics: [
            "Evaluate entire expression",
            "Store boolean in register",
            "Then test and branch",
            "More instructions executed"
          ]
        },
        {
          name: "With Short-Circuit",
          characteristics: [
            "Jump as soon as result known",
            "No boolean register needed",
            "Fewer instructions (often)",
            "Better for common cases"
          ]
        }
      ]
    },
    interactive: { type: "codegen" }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 6 Summary",
    content: {
      sections: [
        {
          title: "Expressions",
          points: [
            "Precedence and associativity determine grouping",
            "Short-circuit evaluation stops early",
            "Side effects change program state"
          ]
        },
        {
          title: "Selection & Iteration",
          points: [
            "if/else, switch for selection",
            "for, while, do-while for iteration",
            "break/continue alter loop flow"
          ]
        },
        {
          title: "Recursion",
          points: [
            "Functions calling themselves",
            "Need base case to terminate",
            "Tail recursion can be optimized"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Precedence Demo
const PrecedenceDemo = () => {
  const [expr, setExpr] = useState('3 + 4 * 5');
  
  const expressions = [
    { expr: '3 + 4 * 5', correct: '3 + (4 * 5) = 23', wrong: '(3 + 4) * 5 = 35', rule: '* has higher precedence than +' },
    { expr: '8 / 4 / 2', correct: '(8 / 4) / 2 = 1', wrong: '8 / (4 / 2) = 4', rule: '/ is left-associative' },
    { expr: '2 ** 3 ** 2', correct: '2 ** (3 ** 2) = 512', wrong: '(2 ** 3) ** 2 = 64', rule: '** is right-associative' },
    { expr: 'a = b = 5', correct: 'a = (b = 5)', wrong: '(a = b) = 5', rule: '= is right-associative' }
  ];

  const current = expressions.find(e => e.expr === expr) || expressions[0];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: Operator Precedence</div>
      
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {expressions.map((e, i) => (
          <button
            key={i}
            onClick={() => setExpr(e.expr)}
            className={`px-4 py-2 rounded-lg font-mono text-lg ${
              expr === e.expr ? 'bg-pink-500 text-white' : 'bg-slate-700'
            }`}
          >
            {e.expr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-green-500/20 border border-green-500 p-5 rounded-lg">
          <div className="text-green-400 font-bold text-xl mb-2">✓ Correct Parsing</div>
          <div className="text-white text-2xl font-mono">{current.correct}</div>
        </div>
        <div className="bg-red-500/20 border border-red-500 p-5 rounded-lg">
          <div className="text-red-400 font-bold text-xl mb-2">✗ Wrong Parsing</div>
          <div className="text-white text-2xl font-mono">{current.wrong}</div>
        </div>
      </div>

      <div className="bg-pink-500/20 p-4 rounded-lg text-center">
        <div className="text-pink-400 text-xl">Rule: {current.rule}</div>
      </div>
    </div>
  );
};

// Short-Circuit Demo
const ShortCircuitDemo = () => {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [op, setOp] = useState('&&');

  const result = op === '&&' ? a && b : a || b;
  const shortCircuited = op === '&&' ? !a : a;
  const bEvaluated = !shortCircuited;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: Short-Circuit Evaluation</div>
      
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => setA(!a)}
          className={`px-6 py-3 rounded-lg font-bold text-xl ${a ? 'bg-green-500' : 'bg-red-500'}`}>
          A = {a.toString()}
        </button>
        
        <select value={op} onChange={(e) => setOp(e.target.value)}
          className="px-4 py-3 rounded-lg bg-slate-700 text-white text-xl font-mono">
          <option value="&&">&&</option>
          <option value="||">||</option>
        </select>
        
        <button onClick={() => setB(!b)}
          className={`px-6 py-3 rounded-lg font-bold text-xl ${
            bEvaluated ? (b ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-600 opacity-50'
          }`}>
          B = {b.toString()}
        </button>
        
        <span className="text-white text-2xl">=</span>
        
        <span className={`px-6 py-3 rounded-lg font-bold text-xl ${result ? 'bg-green-500' : 'bg-red-500'}`}>
          {result.toString()}
        </span>
      </div>

      <div className={`p-5 rounded-lg ${shortCircuited ? 'bg-amber-500/20 border border-amber-500' : 'bg-slate-700'}`}>
        {shortCircuited ? (
          <div className="text-amber-400 text-xl text-center">
            ⚡ <strong>Short-circuited!</strong> B was never evaluated because {
              op === '&&' ? 'A is false (result must be false)' : 'A is true (result must be true)'
            }
          </div>
        ) : (
          <div className="text-slate-300 text-xl text-center">
            Both A and B were evaluated
          </div>
        )}
      </div>

      <div className="mt-6 bg-slate-900 p-4 rounded-lg">
        <div className="text-slate-400 text-lg">Practical use:</div>
        <code className="text-green-400 text-lg">if (ptr != null {op === '&&' ? '&&' : '||'} ptr.value {'>'} 0)</code>
      </div>
    </div>
  );
};

// If-Else Demo
const IfElseDemo = () => {
  const [x, setX] = useState(5);
  
  const getPath = () => {
    if (x > 10) return 'greater';
    else if (x > 5) return 'middle';
    else if (x > 0) return 'small';
    else return 'zero-or-negative';
  };

  const path = getPath();

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: If-Else Chains</div>
      
      <div className="mb-6">
        <label className="text-slate-400 text-lg block mb-2">x = {x}</label>
        <input
          type="range"
          min="-5"
          max="20"
          value={x}
          onChange={(e) => setX(parseInt(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none bg-slate-700"
        />
      </div>

      <div className="bg-slate-900 p-5 rounded-lg font-mono text-lg space-y-2">
        <div className={path === 'greater' ? 'text-green-400' : 'text-slate-500'}>
          if (x {'>'} 10) → "x is greater than 10"
        </div>
        <div className={path === 'middle' ? 'text-green-400' : 'text-slate-500'}>
          else if (x {'>'} 5) → "x is between 6 and 10"
        </div>
        <div className={path === 'small' ? 'text-green-400' : 'text-slate-500'}>
          else if (x {'>'} 0) → "x is between 1 and 5"
        </div>
        <div className={path === 'zero-or-negative' ? 'text-green-400' : 'text-slate-500'}>
          else → "x is 0 or negative"
        </div>
      </div>

      <div className="mt-4 bg-green-500/20 p-4 rounded-lg">
        <span className="text-green-400 text-xl">
          Result: {
            path === 'greater' ? '"x is greater than 10"' :
            path === 'middle' ? '"x is between 6 and 10"' :
            path === 'small' ? '"x is between 1 and 5"' :
            '"x is 0 or negative"'
          }
        </span>
      </div>
    </div>
  );
};

// Switch Demo
const SwitchDemo = () => {
  const [value, setValue] = useState(1);
  const [withBreak, setWithBreak] = useState(true);

  const cases = [
    { val: 1, label: 'One' },
    { val: 2, label: 'Two' },
    { val: 3, label: 'Three' },
    { val: 4, label: 'Default' }
  ];

  const getMatches = () => {
    if (withBreak) {
      return [value > 3 ? 4 : value];
    } else {
      // Fall-through behavior
      const start = value > 3 ? 4 : value;
      return cases.slice(start - 1).map(c => c.val);
    }
  };

  const matches = getMatches();

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: Switch/Case</div>
      
      <div className="flex items-center gap-4 mb-6 justify-center">
        <span className="text-slate-400 text-lg">switch(</span>
        <select value={value} onChange={(e) => setValue(parseInt(e.target.value))}
          className="px-4 py-2 rounded bg-slate-700 text-white text-xl">
          {[1, 2, 3, 5].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <span className="text-slate-400 text-lg">)</span>
        
        <label className="flex items-center gap-2 ml-6">
          <input type="checkbox" checked={withBreak} onChange={(e) => setWithBreak(e.target.checked)} 
            className="w-5 h-5" />
          <span className="text-slate-300 text-lg">With break</span>
        </label>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg font-mono text-lg space-y-2">
        {cases.map(c => (
          <div key={c.val} className={`p-2 rounded ${matches.includes(c.val) ? 'bg-green-500/30 text-green-400' : 'text-slate-500'}`}>
            {c.val < 4 ? `case ${c.val}: print("${c.label}")` : `default: print("${c.label}")`}
            {withBreak && <span className="text-amber-400 ml-2">break;</span>}
          </div>
        ))}
      </div>

      {!withBreak && matches.length > 1 && (
        <div className="mt-4 bg-amber-500/20 p-4 rounded-lg">
          <span className="text-amber-400 text-lg">⚠️ Fall-through: All cases after match are executed!</span>
        </div>
      )}
    </div>
  );
};

// For Loop Demo
const ForLoopDemo = () => {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  const iterations = [
    { i: 1, sum: 0, action: 'Initialize i=1, sum=0' },
    { i: 1, sum: 1, action: 'sum += 1 → sum=1' },
    { i: 2, sum: 1, action: 'i++ → i=2' },
    { i: 2, sum: 3, action: 'sum += 2 → sum=3' },
    { i: 3, sum: 3, action: 'i++ → i=3' },
    { i: 3, sum: 6, action: 'sum += 3 → sum=6' },
    { i: 4, sum: 6, action: 'i++ → i=4' },
    { i: 4, sum: 10, action: 'sum += 4 → sum=10' },
    { i: 5, sum: 10, action: 'i++ → i=5, i > 4 → EXIT' }
  ];

  useEffect(() => {
    if (auto && step < iterations.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [auto, step]);

  const current = iterations[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: For Loop (sum 1 to 4)</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-6 font-mono text-lg text-center">
        <span className="text-pink-400">for</span> (i = 1; i {'<='} 4; i++) sum += i;
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Loop Variable</div>
          <div className="text-4xl font-bold text-pink-400">i = {current.i}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Sum</div>
          <div className="text-4xl font-bold text-green-400">{current.sum}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Step</div>
          <div className="text-4xl font-bold text-white">{step + 1}/{iterations.length}</div>
        </div>
      </div>

      <div className="bg-pink-500/20 p-4 rounded-lg mb-6">
        <div className="text-pink-400 text-xl text-center">{current.action}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setAuto(!auto)}
          className={`px-5 py-2 rounded text-lg ${auto ? 'bg-red-500' : 'bg-green-600'}`}>
          {auto ? '⏹ Stop' : '▶ Auto'}
        </button>
        <button onClick={() => setStep(s => Math.min(iterations.length - 1, s + 1))} 
          disabled={step >= iterations.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Recursion Demo
const RecursionDemo = () => {
  const [n, setN] = useState(5);
  const [step, setStep] = useState(0);

  const generateCalls = (num) => {
    const calls = [];
    const recurse = (x, depth) => {
      calls.push({ value: x, depth, phase: 'call' });
      if (x <= 1) {
        calls.push({ value: 1, depth, phase: 'return', result: 1 });
      } else {
        recurse(x - 1, depth + 1);
        calls.push({ value: x, depth, phase: 'return', result: calls[calls.length - 1].result * x });
      }
    };
    recurse(num, 0);
    return calls;
  };

  const calls = generateCalls(n);
  const currentStep = Math.min(step, calls.length - 1);
  const current = calls[currentStep];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: Factorial Recursion</div>
      
      <div className="flex items-center gap-4 mb-6 justify-center">
        <span className="text-slate-400 text-xl">factorial(</span>
        <select value={n} onChange={(e) => { setN(parseInt(e.target.value)); setStep(0); }}
          className="px-4 py-2 rounded bg-slate-700 text-white text-xl">
          {[3, 4, 5, 6].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-slate-400 text-xl">)</span>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-6">
        <div className="space-y-2">
          {calls.slice(0, currentStep + 1).map((call, i) => (
            <div key={i} style={{ marginLeft: `${call.depth * 30}px` }}
              className={`text-lg font-mono ${call.phase === 'call' ? 'text-blue-400' : 'text-green-400'}`}>
              {call.phase === 'call' 
                ? `→ factorial(${call.value})`
                : `← returns ${call.result}`}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(calls.length - 1, s + 1))} 
          disabled={step >= calls.length - 1}
          className="px-5 py-2 bg-pink-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>

      {step >= calls.length - 1 && (
        <div className="mt-4 bg-green-500/20 p-4 rounded-lg text-center">
          <span className="text-green-400 text-2xl font-bold">factorial({n}) = {calls[calls.length - 1].result}</span>
        </div>
      )}
    </div>
  );
};

// Tail Recursion Demo  
const TailRecursionDemo = () => {
  const [a, setA] = useState(48);
  const [b, setB] = useState(18);
  const [step, setStep] = useState(0);

  const generateGCDSteps = (x, y) => {
    const steps = [];
    while (x !== y) {
      steps.push({ a: x, b: y, action: x > y ? `gcd(${x}-${y}, ${y})` : `gcd(${x}, ${y}-${x})` });
      if (x > y) x = x - y;
      else y = y - x;
    }
    steps.push({ a: x, b: y, action: `a == b, return ${x}` });
    return steps;
  };

  const steps = generateGCDSteps(a, b);
  const current = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-pink-400 text-lg mb-4 font-mono">Interactive: Tail-Recursive GCD</div>
      
      <div className="flex items-center gap-4 mb-6 justify-center">
        <span className="text-slate-400 text-xl">gcd(</span>
        <input type="number" value={a} onChange={(e) => { setA(parseInt(e.target.value) || 1); setStep(0); }}
          className="w-20 px-3 py-2 rounded bg-slate-700 text-white text-xl text-center" />
        <span className="text-slate-400 text-xl">,</span>
        <input type="number" value={b} onChange={(e) => { setB(parseInt(e.target.value) || 1); setStep(0); }}
          className="w-20 px-3 py-2 rounded bg-slate-700 text-white text-xl text-center" />
        <span className="text-slate-400 text-xl">)</span>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-slate-400 text-base">a</div>
            <div className="text-3xl font-bold text-pink-400">{current.a}</div>
          </div>
          <div>
            <div className="text-slate-400 text-base">b</div>
            <div className="text-3xl font-bold text-pink-400">{current.b}</div>
          </div>
          <div>
            <div className="text-slate-400 text-base">Step</div>
            <div className="text-3xl font-bold text-white">{step + 1}/{steps.length}</div>
          </div>
        </div>
        <div className="mt-4 text-center text-green-400 text-xl font-mono">{current.action}</div>
      </div>

      <div className="flex gap-3 justify-center mb-4">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-pink-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>

      <div className="bg-pink-500/20 p-4 rounded-lg">
        <div className="text-pink-400 text-lg text-center">
          ✨ Tail recursive: can be optimized to use constant stack space!
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🔄</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-pink-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.examples && (
      <div className="mt-6 space-y-3">
        {slide.content.examples.map((ex, i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-lg">
            <code className="text-pink-400 text-lg font-mono">{ex.code}</code>
            <p className="text-slate-400 text-lg mt-2">{ex.explanation}</p>
          </div>
        ))}
      </div>
    )}
    {slide.content.benefits && (
      <div className="mt-6 space-y-2">
        {slide.content.benefits.map((b, i) => (
          <div key={i} className="text-slate-300 text-xl">✓ {b}</div>
        ))}
      </div>
    )}
    {slide.content.code && (
      <div className="mt-6 bg-slate-900 p-5 rounded-lg">
        <pre className="text-green-400 font-mono text-lg whitespace-pre-wrap">{slide.content.code}</pre>
      </div>
    )}
    {slide.content.note && <p className="mt-6 text-pink-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'short-circuit' && <ShortCircuitDemo />}
    {slide.interactive?.type === 'if-else' && <IfElseDemo />}
    {slide.interactive?.type === 'switch' && <SwitchDemo />}
    {slide.interactive?.type === 'for-loop' && <ForLoopDemo />}
    {slide.interactive?.type === 'recursion' && <RecursionDemo />}
    {slide.interactive?.type === 'tail-recursion' && <TailRecursionDemo />}
  </div>
);

const TableSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>}
    <div className="overflow-x-auto">
      <table className="w-full text-xl">
        <thead>
          <tr className="border-b border-slate-700">
            {slide.content.headers?.map((h, i) => (
              <th key={i} className="text-left p-4 text-pink-400 font-bold text-2xl">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.content.rows?.map((row, i) => (
            <tr key={i} className="border-b border-slate-800">
              {row.map((cell, j) => (
                <td key={j} className={`p-4 text-xl ${j === 0 ? 'text-white font-medium' : 'text-slate-300'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {slide.content.note && <p className="mt-6 text-pink-400 text-xl italic">{slide.content.note}</p>}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-orange-500 bg-orange-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-orange-400'}`}>{a.name}</h3>
          {a.code && <pre className="text-green-400 font-mono text-lg mb-3 bg-slate-900 p-3 rounded">{a.code}</pre>}
          {a.behavior && <p className="text-white text-xl mb-2">{a.behavior}</p>}
          {a.minIterations && <p className="text-slate-400 text-lg">{a.minIterations}</p>}
          {a.characteristics && (
            <ul className="space-y-2">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-lg">• {c}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    {slide.interactive?.type === 'while-loops' && <ForLoopDemo />}
    {slide.interactive?.type === 'codegen' && <ShortCircuitDemo />}
  </div>
);

const InteractiveSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-4">{slide.content.description}</p>}
    {slide.interactive?.type === 'precedence' && <PrecedenceDemo />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-pink-400 font-bold text-2xl mb-5">{section.title}</h3>
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
    case 'table': return <TableSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'interactive': return <InteractiveSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter6Slides({ onBackToChapters }) {
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
            <span className="text-pink-400 font-bold text-lg">Ch 6: {CHAPTER_CONFIG.title}</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 6 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-pink-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-pink-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-pink-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-pink-600 rounded text-lg disabled:opacity-30">
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

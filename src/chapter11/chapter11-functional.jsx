import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 11: FUNCTIONAL LANGUAGES
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 11,
  title: "Functional Languages",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#22c55e" // green
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
    title: "Chapter 11: Functional Languages",
    content: {
      subtitle: "Computing by Composing Functions",
      topics: [
        "Lambda Calculus",
        "Pure Functions",
        "No Side Effects",
        "Higher-Order Functions",
        "Recursion",
        "Scheme & Haskell"
      ]
    }
  },

  // HISTORICAL ORIGINS
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Historical Origins",
    content: {
      description: "Two models of computation from the 1930s:",
      items: [
        { icon: "🤖", text: "Turing Machine", detail: "Computes by changing values in memory cells → Imperative" },
        { icon: "λ", text: "Lambda Calculus", detail: "Computes by substituting parameters → Functional" }
      ],
      note: "Church's thesis: both models are equally powerful (can compute the same things)"
    }
  },

  // LAMBDA CALCULUS
  {
    id: 3,
    section: "intro",
    type: "concept",
    title: "Lambda Calculus",
    content: {
      description: "Alonzo Church's foundation for functional programming:",
      items: [
        { icon: "λ", text: "Lambda Abstraction", detail: "λx.e creates a function with parameter x and body e" },
        { icon: "📥", text: "Application", detail: "(λx.e) a substitutes a for x in e" },
        { icon: "🔄", text: "Beta Reduction", detail: "(λx.x+1) 5 → 5+1 → 6" }
      ],
      code: `// Lambda calculus
λx.x+1        // Function that adds 1
(λx.x+1) 5    // Apply to 5
→ 5+1 → 6    // Result`
    }
  },

  // KEY IDEA
  {
    id: 4,
    section: "concepts",
    type: "concept",
    title: "The Key Idea",
    content: {
      description: "Do everything by composing functions:",
      items: [
        { icon: "🚫", text: "No Mutable State", detail: "Variables don't change once bound" },
        { icon: "🔒", text: "No Side Effects", detail: "Functions only compute values, nothing else" },
        { icon: "🔗", text: "Composition", detail: "Build complex functions from simple ones" },
        { icon: "📐", text: "Referential Transparency", detail: "Same input → always same output" }
      ]
    },
    interactive: { type: "pure-vs-impure" }
  },

  // NECESSARY FEATURES
  {
    id: 5,
    section: "concepts",
    type: "concept",
    title: "Essential Features",
    content: {
      description: "What functional languages need:",
      items: [
        { icon: "1️⃣", text: "First-Class Functions", detail: "Functions are values - pass, return, store" },
        { icon: "⬆️", text: "Higher-Order Functions", detail: "Functions that take/return functions" },
        { icon: "📋", text: "Powerful Lists", detail: "Primary data structure" },
        { icon: "🗑️", text: "Garbage Collection", detail: "Automatic memory management" },
        { icon: "🔄", text: "Tail Recursion", detail: "Efficient recursion (no stack growth)" }
      ]
    }
  },

  // RECURSION REPLACES LOOPS
  {
    id: 6,
    section: "concepts",
    type: "concept",
    title: "Recursion Replaces Iteration",
    content: {
      description: "No loops - use recursion instead:",
      items: [
        { icon: "🔄", text: "Recursive Thinking", detail: "Break problem into smaller same-shaped problems" },
        { icon: "🛑", text: "Base Case", detail: "Condition that stops recursion" },
        { icon: "⚡", text: "Tail Recursion", detail: "Last action is recursive call → optimized to loop" }
      ]
    },
    interactive: { type: "loop-to-recursion" }
  },

  // HIGHER ORDER FUNCTIONS
  {
    id: 7,
    section: "hof",
    type: "concept",
    title: "Higher-Order Functions",
    content: {
      description: "Functions that operate on functions:",
      items: [
        { icon: "🗺️", text: "Map", detail: "Apply function to each element" },
        { icon: "🔍", text: "Filter", detail: "Keep elements that satisfy predicate" },
        { icon: "📦", text: "Fold/Reduce", detail: "Combine all elements into one value" }
      ],
      code: `map    (+1) [1,2,3]     → [2,3,4]
filter (>2) [1,2,3,4]   → [3,4]
fold   (+)  0 [1,2,3]   → 6`
    },
    interactive: { type: "map-filter-fold" }
  },

  // CURRYING
  {
    id: 8,
    section: "hof",
    type: "concept",
    title: "Currying",
    content: {
      description: "Transforming multi-argument functions (named after Haskell Curry):",
      items: [
        { icon: "🔗", text: "Concept", detail: "f(x,y) becomes f(x)(y) - partial application" },
        { icon: "➕", text: "Example", detail: "add x y = x + y; add3 = add 3; add3 5 → 8" },
        { icon: "🏗️", text: "Building Blocks", detail: "Create specialized functions from general ones" }
      ],
      code: `-- Haskell currying
add x y = x + y    -- Two arguments
add 3              -- Partial application → function
(add 3) 5          -- Apply to 5 → 8

-- Same as:
add3 = add 3       -- add3 is a function
add3 5             -- → 8`
    },
    interactive: { type: "currying" }
  },

  // SCHEME OVERVIEW
  {
    id: 9,
    section: "scheme",
    type: "concept",
    title: "Scheme: An Elegant Lisp",
    content: {
      description: "A simple, clean functional language:",
      items: [
        { icon: "📝", text: "S-Expressions", detail: "Everything is a list: (operator arg1 arg2 ...)" },
        { icon: "🔄", text: "Prefix Notation", detail: "(+ 3 4) not 3 + 4" },
        { icon: "💬", text: "Quote", detail: "'(+ 3 4) → data, not code" },
        { icon: "🔁", text: "REPL", detail: "Read-Eval-Print Loop" }
      ],
      code: `(+ 3 4)              → 7
(* 2 (+ 3 4))        → 14
'(+ 3 4)             → (+ 3 4)  ; quoted = data
(define square 
  (lambda (x) (* x x)))
(square 5)           → 25`
    }
  },

  // SCHEME BASICS
  {
    id: 10,
    section: "scheme",
    type: "concept",
    title: "Scheme Basics",
    content: {
      description: "Core Scheme constructs:",
      items: [
        { icon: "λ", text: "lambda", detail: "(lambda (x) (* x x)) - create function" },
        { icon: "📛", text: "define", detail: "(define name value) - bind name" },
        { icon: "❓", text: "if", detail: "(if test then else)" },
        { icon: "📋", text: "cond", detail: "Multi-way conditional" },
        { icon: "🔗", text: "let", detail: "Local bindings" }
      ]
    },
    interactive: { type: "scheme-eval" }
  },

  // LISTS IN SCHEME
  {
    id: 11,
    section: "scheme",
    type: "concept",
    title: "Lists in Scheme",
    content: {
      description: "The fundamental data structure:",
      items: [
        { icon: "📦", text: "cons", detail: "(cons 1 '(2 3)) → (1 2 3) - construct" },
        { icon: "1️⃣", text: "car", detail: "(car '(1 2 3)) → 1 - first element" },
        { icon: "📋", text: "cdr", detail: "(cdr '(1 2 3)) → (2 3) - rest of list" },
        { icon: "❓", text: "null?", detail: "(null? '()) → #t - empty test" }
      ],
      code: `(cons 1 '(2 3))      → (1 2 3)
(car '(1 2 3))       → 1
(cdr '(1 2 3))       → (2 3)
(car (cdr '(1 2 3))) → 2  ; cadr`
    },
    interactive: { type: "list-ops" }
  },

  // HASKELL OVERVIEW
  {
    id: 12,
    section: "haskell",
    type: "concept",
    title: "Haskell: Pure Functional",
    content: {
      description: "The leading functional research language:",
      items: [
        { icon: "✨", text: "Pure", detail: "No side effects allowed (except in IO monad)" },
        { icon: "😴", text: "Lazy", detail: "Expressions evaluated only when needed" },
        { icon: "🏷️", text: "Strong Static Types", detail: "Type inference - rarely write types" },
        { icon: "🔧", text: "Pattern Matching", detail: "Elegant function definitions" }
      ],
      code: `-- Haskell factorial
factorial 0 = 1
factorial n = n * factorial (n-1)

-- List comprehension
[x*2 | x <- [1..5]]  → [2,4,6,8,10]`
    }
  },

  // LAZY EVALUATION
  {
    id: 13,
    section: "haskell",
    type: "concept",
    title: "Lazy Evaluation",
    content: {
      description: "Evaluate expressions only when their values are needed:",
      items: [
        { icon: "😴", text: "Delayed", detail: "Arguments not evaluated until used" },
        { icon: "♾️", text: "Infinite Lists", detail: "[1..] works because we only compute what's needed" },
        { icon: "🎯", text: "Short-circuit", detail: "if True then x else (1/0) doesn't crash" }
      ],
      code: `-- Infinite list of ones
ones = 1 : ones        -- [1,1,1,1,...]

-- Take first 5
take 5 ones            → [1,1,1,1,1]

-- Natural numbers
nats = [1..]           -- [1,2,3,4,...]
take 3 nats            → [1,2,3]`
    },
    interactive: { type: "lazy-eval" }
  },

  // PATTERN MATCHING
  {
    id: 14,
    section: "haskell",
    type: "concept",
    title: "Pattern Matching",
    content: {
      description: "Elegant way to define functions by cases:",
      items: [
        { icon: "🔀", text: "Multiple Equations", detail: "Each pattern = one case" },
        { icon: "📦", text: "Destructuring", detail: "Extract parts of data structures" },
        { icon: "🛡️", text: "Guards", detail: "Conditional patterns" }
      ],
      code: `-- Pattern matching on list structure
length []     = 0
length (x:xs) = 1 + length xs

-- Pattern matching on values
fib 0 = 0
fib 1 = 1  
fib n = fib (n-1) + fib (n-2)`
    }
  },

  // TYPE INFERENCE
  {
    id: 15,
    section: "haskell",
    type: "concept",
    title: "Type Inference",
    content: {
      description: "Compiler deduces types automatically:",
      items: [
        { icon: "🤖", text: "Automatic", detail: "Rarely need to write type annotations" },
        { icon: "🔍", text: "Hindley-Milner", detail: "Algorithm infers most general type" },
        { icon: "🛡️", text: "Catches Errors", detail: "Type errors found at compile time" }
      ],
      code: `-- Types inferred automatically:
add x y = x + y    -- add :: Num a => a -> a -> a

length []     = 0
length (x:xs) = 1 + length xs
                   -- length :: [a] -> Int`
    }
  },

  // EVALUATION ORDER
  {
    id: 16,
    section: "evaluation",
    type: "comparison",
    title: "Evaluation Order",
    content: {
      approaches: [
        {
          name: "Applicative (Eager)",
          characteristics: [
            "Evaluate arguments first",
            "Used by most languages",
            "May evaluate unused args",
            "Predictable performance"
          ],
          examples: "Scheme, ML, OCaml"
        },
        {
          name: "Normal (Lazy)",
          characteristics: [
            "Evaluate args when needed",
            "Never evaluates unused args",
            "Enables infinite structures",
            "Can be slower (memoization helps)"
          ],
          examples: "Haskell, Miranda"
        }
      ]
    }
  },

  // ADVANTAGES
  {
    id: 17,
    section: "perspective",
    type: "concept",
    title: "Advantages of Functional Programming",
    content: {
      description: "Why functional programming matters:",
      items: [
        { icon: "🧠", text: "Easier to Reason About", detail: "No hidden state changes" },
        { icon: "🧪", text: "Easier to Test", detail: "Same input → same output, always" },
        { icon: "⚡", text: "Parallelism", detail: "No shared mutable state → easy to parallelize" },
        { icon: "📝", text: "Concise Code", detail: "Programs often surprisingly short" },
        { icon: "🔧", text: "Refactoring", detail: "Substitution is always safe" }
      ]
    }
  },

  // CHALLENGES
  {
    id: 18,
    section: "perspective",
    type: "concept",
    title: "Challenges of Functional Programming",
    content: {
      description: "Difficulties with the functional approach:",
      items: [
        { icon: "🖥️", text: "Von Neumann Mismatch", detail: "Hardware is imperative; FP less efficient" },
        { icon: "📋", text: "Data Copying", detail: "Can't mutate → must copy" },
        { icon: "🗑️", text: "Garbage Collection", detail: "Required; can cause pauses" },
        { icon: "🧠", text: "Different Thinking", detail: "Requires new mental model" },
        { icon: "📤", text: "I/O", detail: "Hard to integrate with pure model" }
      ]
    }
  },

  // FP IN MAINSTREAM
  {
    id: 19,
    section: "perspective",
    type: "concept",
    title: "Functional Ideas in Mainstream Languages",
    content: {
      description: "Functional features adopted widely:",
      items: [
        { icon: "λ", text: "Lambdas", detail: "Java 8, C++11, Python, JavaScript" },
        { icon: "🗺️", text: "Map/Filter/Reduce", detail: "In almost every modern language" },
        { icon: "⛓️", text: "Immutable Data", detail: "Immutable collections, const" },
        { icon: "🔗", text: "Closures", detail: "Functions capturing environment" }
      ],
      code: `// JavaScript functional style
[1,2,3,4,5]
  .filter(x => x > 2)
  .map(x => x * 2)
  .reduce((a,b) => a + b, 0)  // → 24`
    }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 11 Summary",
    content: {
      sections: [
        {
          title: "Core Ideas",
          points: [
            "Compute by composing functions",
            "No mutable state, no side effects",
            "Recursion replaces loops"
          ]
        },
        {
          title: "Key Features",
          points: [
            "First-class & higher-order functions",
            "Map, filter, fold",
            "Lazy evaluation (Haskell)"
          ]
        },
        {
          title: "Languages",
          points: [
            "Scheme: simple, elegant Lisp",
            "Haskell: pure, lazy, typed",
            "FP ideas now in all languages"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Pure vs Impure Demo
const PureVsImpureDemo = () => {
  const [count, setCount] = useState(0);
  const [pureResults, setPureResults] = useState([]);

  const impureAdd = () => {
    setCount(c => c + 1);
    return count + 1;
  };

  const pureAdd = (x) => x + 1;

  const runPure = () => {
    const results = [1, 2, 3].map(x => pureAdd(x));
    setPureResults(results);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Pure vs Impure Functions</div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-red-500/10 border border-red-500 p-4 rounded-lg">
          <div className="text-red-400 font-bold text-xl mb-3">❌ Impure (has side effect)</div>
          <div className="bg-slate-900 p-3 rounded font-mono text-base mb-3">
            <span className="text-red-400">let</span> count = {count};<br/>
            <span className="text-red-400">function</span> add() {'{'}<br/>
            <span className="ml-4">count++;</span> <span className="text-slate-500">// Side effect!</span><br/>
            <span className="ml-4">return count;</span><br/>
            {'}'}
          </div>
          <button onClick={impureAdd} className="px-4 py-2 bg-red-500 rounded text-lg">
            Call add() → {count + 1}
          </button>
          <div className="text-slate-400 text-sm mt-2">Result depends on when you call it!</div>
        </div>

        <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg">
          <div className="text-green-400 font-bold text-xl mb-3">✓ Pure (no side effects)</div>
          <div className="bg-slate-900 p-3 rounded font-mono text-base mb-3">
            <span className="text-green-400">function</span> add(x) {'{'}<br/>
            <span className="ml-4">return x + 1;</span><br/>
            {'}'}
          </div>
          <button onClick={runPure} className="px-4 py-2 bg-green-500 rounded text-lg">
            map(add, [1,2,3])
          </button>
          {pureResults.length > 0 && (
            <div className="text-white text-lg mt-2">→ [{pureResults.join(', ')}]</div>
          )}
          <div className="text-slate-400 text-sm mt-2">Same input → always same output!</div>
        </div>
      </div>
    </div>
  );
};

// Loop to Recursion Demo
const LoopToRecursionDemo = () => {
  const [n, setN] = useState(5);
  const [step, setStep] = useState(0);

  const trace = [];
  let acc = 1;
  for (let i = n; i >= 1; i--) {
    trace.push({ i, acc, next: acc * i });
    acc *= i;
  }
  trace.push({ i: 0, acc, done: true });

  const current = trace[Math.min(step, trace.length - 1)];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Loop → Recursion</div>
      
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Imperative (loop)</div>
          <pre className="text-amber-400 font-mono text-sm">{`result = 1
for i = ${n} downto 1:
    result = result * i
return result`}</pre>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Functional (recursion)</div>
          <pre className="text-green-400 font-mono text-sm">{`fact 0 = 1
fact n = n * fact(n-1)

fact ${n}`}</pre>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-slate-400">n =</span>
        <input type="range" min="1" max="7" value={n}
          onChange={(e) => { setN(parseInt(e.target.value)); setStep(0); }}
          className="w-32" />
        <span className="text-white text-xl">{n}</span>
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg mb-4">
        {current.done ? (
          <div className="text-green-400 text-2xl font-bold text-center">
            factorial({n}) = {current.acc}
          </div>
        ) : (
          <div className="text-green-400 text-xl text-center font-mono">
            fact({current.i}) = {current.i} × fact({current.i - 1}) → {current.i} × ... = {current.next}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(trace.length - 1, s + 1))} 
          disabled={step >= trace.length - 1}
          className="px-4 py-2 bg-green-600 rounded disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Map Filter Fold Demo
const MapFilterFoldDemo = () => {
  const [operation, setOperation] = useState('map');
  const input = [1, 2, 3, 4, 5];

  const operations = {
    map: {
      fn: 'x => x * 2',
      result: input.map(x => x * 2),
      desc: 'Apply function to each element'
    },
    filter: {
      fn: 'x => x > 2',
      result: input.filter(x => x > 2),
      desc: 'Keep elements that pass test'
    },
    fold: {
      fn: '(acc, x) => acc + x',
      result: [input.reduce((a, b) => a + b, 0)],
      desc: 'Combine all elements into one'
    }
  };

  const current = operations[operation];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Map, Filter, Fold</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        {Object.keys(operations).map(op => (
          <button
            key={op}
            onClick={() => setOperation(op)}
            className={`px-5 py-2 rounded-lg text-lg capitalize ${
              operation === op ? 'bg-green-500 text-white' : 'bg-slate-700'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <div className="flex items-center justify-center gap-4 text-xl">
          <span className="text-blue-400 font-mono">[{input.join(', ')}]</span>
          <span className="text-slate-400">→</span>
          <span className="text-green-400 font-mono">{operation}</span>
          <span className="text-amber-400 font-mono">({current.fn})</span>
          <span className="text-slate-400">→</span>
          <span className="text-green-400 font-bold font-mono">
            {operation === 'fold' ? current.result[0] : `[${current.result.join(', ')}]`}
          </span>
        </div>
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg text-center">
        <div className="text-green-400 text-xl">{current.desc}</div>
      </div>
    </div>
  );
};

// Currying Demo
const CurryingDemo = () => {
  const [x, setX] = useState(3);
  const [y, setY] = useState(5);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Currying</div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-slate-400">x = {x}</label>
          <input type="range" min="1" max="10" value={x}
            onChange={(e) => setX(parseInt(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-slate-400">y = {y}</label>
          <input type="range" min="1" max="10" value={y}
            onChange={(e) => setY(parseInt(e.target.value))}
            className="w-full" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-900 p-4 rounded-lg">
          <span className="text-green-400 font-mono">add x y = x + y</span>
          <span className="text-slate-500 ml-4">-- Function of two args</span>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg">
          <span className="text-amber-400 font-mono">add{x} = add {x}</span>
          <span className="text-slate-500 ml-4">-- Partial application</span>
        </div>
        
        <div className="bg-green-500/20 p-4 rounded-lg">
          <span className="text-green-400 font-mono text-xl">add{x} {y} = {x} + {y} = <strong>{x + y}</strong></span>
        </div>
      </div>

      <div className="mt-4 text-slate-400 text-center">
        Currying: add{x} is a <em>new function</em> waiting for one more argument!
      </div>
    </div>
  );
};

// Scheme Eval Demo
const SchemeEvalDemo = () => {
  const [expr, setExpr] = useState('(+ 3 4)');

  const examples = [
    { expr: '(+ 3 4)', result: '7' },
    { expr: '(* 2 (+ 3 4))', result: '14' },
    { expr: "(car '(1 2 3))", result: '1' },
    { expr: "(cdr '(1 2 3))", result: '(2 3)' },
    { expr: '(if (< 2 3) 10 20)', result: '10' },
    { expr: '((lambda (x) (* x x)) 5)', result: '25' }
  ];

  const current = examples.find(e => e.expr === expr) || examples[0];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Scheme Evaluation</div>
      
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setExpr(ex.expr)}
            className={`px-3 py-2 rounded font-mono text-base ${
              expr === ex.expr ? 'bg-green-500 text-white' : 'bg-slate-700'
            }`}
          >
            {ex.expr}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="flex items-center gap-4 text-xl font-mono">
          <span className="text-green-400">{current.expr}</span>
          <span className="text-slate-400">⇒</span>
          <span className="text-amber-400 font-bold">{current.result}</span>
        </div>
      </div>
    </div>
  );
};

// List Ops Demo
const ListOpsDemo = () => {
  const [op, setOp] = useState('cons');

  const ops = {
    cons: { code: "(cons 1 '(2 3))", result: '(1 2 3)', desc: 'Add to front' },
    car: { code: "(car '(1 2 3))", result: '1', desc: 'Get first element' },
    cdr: { code: "(cdr '(1 2 3))", result: '(2 3)', desc: 'Get rest of list' },
    cadr: { code: "(car (cdr '(1 2 3)))", result: '2', desc: 'Second element' }
  };

  const current = ops[op];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: List Operations</div>
      
      <div className="flex gap-2 mb-4 justify-center">
        {Object.keys(ops).map(o => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`px-4 py-2 rounded font-mono text-lg ${op === o ? 'bg-green-500 text-white' : 'bg-slate-700'}`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-green-400 font-mono text-2xl mb-2">{current.code}</div>
          <div className="text-slate-400">⇒</div>
          <div className="text-amber-400 font-mono text-2xl font-bold">{current.result}</div>
        </div>
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg text-center">
        <div className="text-green-400 text-lg">{current.desc}</div>
      </div>

      <div className="mt-4 flex justify-center gap-1">
        {['1', '2', '3'].map((n, i) => (
          <div key={i} className={`w-12 h-12 rounded flex items-center justify-center font-mono text-xl ${
            (op === 'car' && i === 0) || (op === 'cadr' && i === 1) ? 'bg-amber-500 text-white' :
            (op === 'cdr' && i > 0) ? 'bg-green-500/50 text-white' :
            'bg-slate-700 text-slate-300'
          }`}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
};

// Lazy Eval Demo
const LazyEvalDemo = () => {
  const [taken, setTaken] = useState(5);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-green-400 text-lg mb-4 font-mono">Interactive: Lazy Evaluation</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono">
        <div className="text-green-400">nats = [1..]  <span className="text-slate-500">-- infinite list!</span></div>
        <div className="text-green-400">take {taken} nats</div>
      </div>

      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-slate-400">Take:</span>
        <input type="range" min="1" max="10" value={taken}
          onChange={(e) => setTaken(parseInt(e.target.value))}
          className="w-32" />
        <span className="text-white text-xl">{taken}</span>
      </div>

      <div className="flex gap-1 justify-center mb-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n, i) => (
          <div key={i} className={`w-10 h-10 rounded flex items-center justify-center font-mono ${
            i < taken ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'
          }`}>
            {n}
          </div>
        ))}
        <div className="w-10 h-10 rounded flex items-center justify-center font-mono bg-slate-800 text-slate-500">
          ...
        </div>
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg text-center">
        <div className="text-green-400 text-lg">
          → [{Array.from({ length: taken }, (_, i) => i + 1).join(', ')}]
        </div>
        <div className="text-slate-400 text-sm mt-2">
          Only computes the first {taken} numbers - the rest are never evaluated!
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
    <div className="text-7xl mb-8">λ</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-green-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-6 text-green-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'pure-vs-impure' && <PureVsImpureDemo />}
    {slide.interactive?.type === 'loop-to-recursion' && <LoopToRecursionDemo />}
    {slide.interactive?.type === 'map-filter-fold' && <MapFilterFoldDemo />}
    {slide.interactive?.type === 'currying' && <CurryingDemo />}
    {slide.interactive?.type === 'scheme-eval' && <SchemeEvalDemo />}
    {slide.interactive?.type === 'list-ops' && <ListOpsDemo />}
    {slide.interactive?.type === 'lazy-eval' && <LazyEvalDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-amber-500 bg-amber-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-amber-400' : 'text-green-400'}`}>{a.name}</h3>
          {a.characteristics && (
            <ul className="space-y-2">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-xl">• {c}</li>
              ))}
            </ul>
          )}
          {a.examples && <p className="text-slate-500 text-lg mt-3">Examples: {a.examples}</p>}
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
          <h3 className="text-green-400 font-bold text-2xl mb-5">{section.title}</h3>
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
export default function Chapter11Slides({ onBackToChapters }) {
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
            <span className="text-green-400 font-bold text-lg">Ch 11: Functional Languages</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 11 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-green-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-green-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-green-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 rounded text-lg disabled:opacity-30">
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

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 7: TYPE SYSTEMS
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 7,
  title: "Type Systems",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#6366f1" // indigo
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
    title: "Chapter 7: Type Systems",
    content: {
      subtitle: "Data Types and Type Checking",
      topics: [
        "What Are Types?",
        "Strong vs Weak Typing",
        "Static vs Dynamic Typing",
        "Type Equivalence",
        "Type Coercion",
        "Polymorphism & Generics"
      ]
    }
  },

  // WHAT ARE TYPES
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "What Are Types?",
    content: {
      description: "Three ways to think about types:",
      items: [
        { icon: "📊", text: "Denotational", detail: "Collection of values from a domain (int = {..., -1, 0, 1, 2, ...})" },
        { icon: "🏗️", text: "Structural", detail: "Internal structure described in terms of primitive types" },
        { icon: "🔧", text: "Abstraction", detail: "Collection of operations that can be applied (what you can DO)" }
      ],
      note: "All three views are useful; the abstraction view emphasizes behavior over representation"
    }
  },

  // WHY TYPES
  {
    id: 3,
    section: "intro",
    type: "concept",
    title: "Why Do We Need Types?",
    content: {
      description: "Types serve several crucial purposes:",
      items: [
        { icon: "📝", text: "Implicit Context", detail: "Compiler knows how to handle data without explicit instructions" },
        { icon: "🛡️", text: "Error Checking", detail: "Catch meaningless operations at compile time" },
        { icon: "⚡", text: "Optimization", detail: "Compiler can generate better code knowing types" },
        { icon: "📖", text: "Documentation", detail: "Types tell readers what kind of data is expected" }
      ],
      note: "Type checking cannot prevent ALL errors, but catches enough to be very useful"
    }
  },

  // STRONG VS WEAK TYPING
  {
    id: 4,
    section: "typing",
    type: "comparison",
    title: "Strong vs Weak Typing",
    content: {
      approaches: [
        {
          name: "Strong Typing",
          characteristics: [
            "Language prevents inappropriate operations",
            "No implicit type violations",
            "Errors caught rather than causing undefined behavior"
          ],
          examples: "Java, Python, Haskell, Rust"
        },
        {
          name: "Weak Typing",
          characteristics: [
            "More implicit conversions allowed",
            "Can treat memory as different types",
            "Easier to cause undefined behavior"
          ],
          examples: "C, C++, JavaScript (in some ways)"
        }
      ],
      note: "Strong typing is about SAFETY, not about when checking happens"
    }
  },

  // STATIC VS DYNAMIC TYPING
  {
    id: 5,
    section: "typing",
    type: "comparison",
    title: "Static vs Dynamic Typing",
    content: {
      approaches: [
        {
          name: "Static Typing",
          characteristics: [
            "Types checked at COMPILE time",
            "Variables have fixed types",
            "Errors found before running",
            "Can optimize based on types"
          ],
          examples: "C, C++, Java, Rust, Go"
        },
        {
          name: "Dynamic Typing",
          characteristics: [
            "Types checked at RUN time",
            "Variables can hold any type",
            "More flexible, less verbose",
            "Errors found when code runs"
          ],
          examples: "Python, Ruby, JavaScript, Lisp"
        }
      ]
    },
    interactive: { type: "static-dynamic" }
  },

  // TYPING QUADRANT
  {
    id: 6,
    section: "typing",
    type: "table",
    title: "Language Type System Classification",
    content: {
      headers: ["Language", "Strong/Weak", "Static/Dynamic"],
      rows: [
        ["Java", "Strong", "Static"],
        ["Python", "Strong", "Dynamic"],
        ["C", "Weak", "Static"],
        ["JavaScript", "Weak", "Dynamic"],
        ["Haskell", "Strong", "Static"],
        ["Ruby", "Strong", "Dynamic"],
        ["Rust", "Strong", "Static"],
        ["Common Lisp", "Strong", "Dynamic"]
      ]
    },
    interactive: { type: "typing-grid" }
  },

  // PRIMITIVE TYPES
  {
    id: 7,
    section: "types",
    type: "concept",
    title: "Primitive (Scalar) Types",
    content: {
      description: "Built-in types provided by the language:",
      items: [
        { icon: "🔢", text: "Integer Types", detail: "int, short, long, byte - whole numbers" },
        { icon: "📊", text: "Floating Point", detail: "float, double - real numbers with decimals" },
        { icon: "🔤", text: "Character", detail: "char - single character (often 1-4 bytes)" },
        { icon: "✓", text: "Boolean", detail: "true/false - logical values" },
        { icon: "📋", text: "Enumeration", detail: "Named set of values (enum Day {Mon, Tue, ...})" }
      ]
    }
  },

  // COMPOSITE TYPES
  {
    id: 8,
    section: "types",
    type: "concept",
    title: "Composite Types",
    content: {
      description: "Types built from other types:",
      items: [
        { icon: "📦", text: "Records/Structs", detail: "Collection of named fields of different types" },
        { icon: "📚", text: "Arrays", detail: "Indexed collection of same-type elements" },
        { icon: "📝", text: "Strings", detail: "Sequence of characters (often special array)" },
        { icon: "👆", text: "Pointers/References", detail: "Address of another value in memory" },
        { icon: "🔗", text: "Lists", detail: "Linked sequence of elements" },
        { icon: "🏷️", text: "Unions/Variants", detail: "Value can be one of several types" }
      ]
    }
  },

  // TYPE EQUIVALENCE
  {
    id: 9,
    section: "checking",
    type: "concept",
    title: "Type Equivalence",
    content: {
      description: "When are two types considered the same?",
      items: [
        { icon: "📛", text: "Name Equivalence", detail: "Types are same only if they have the same name" },
        { icon: "🏗️", text: "Structural Equivalence", detail: "Types are same if they have the same structure" }
      ]
    },
    interactive: { type: "equivalence" }
  },

  // NAME VS STRUCTURAL
  {
    id: 10,
    section: "checking",
    type: "comparison",
    title: "Name vs Structural Equivalence",
    content: {
      approaches: [
        {
          name: "Name Equivalence",
          code: "type Age = int\ntype Year = int\n// Age ≠ Year (different names)",
          characteristics: [
            "Based on declaration names",
            "More restrictive",
            "Catches logical errors",
            "Modern languages prefer this"
          ],
          examples: "Ada, Pascal (strict), Java classes"
        },
        {
          name: "Structural Equivalence",
          code: "type Age = int\ntype Year = int\n// Age = Year (same structure)",
          characteristics: [
            "Based on type structure",
            "More permissive",
            "May allow unintended matches",
            "Older approach"
          ],
          examples: "C (mostly), ML, TypeScript (for interfaces)"
        }
      ]
    }
  },

  // TYPE COMPATIBILITY
  {
    id: 11,
    section: "checking",
    type: "concept",
    title: "Type Compatibility",
    content: {
      description: "When can type A be used where type B is expected?",
      items: [
        { icon: "=", text: "Equivalence", detail: "Types are the same - always compatible" },
        { icon: "⊂", text: "Subtyping", detail: "A is subtype of B - can use A for B" },
        { icon: "🔄", text: "Coercion", detail: "A can be converted to B automatically" }
      ],
      note: "Compatibility is more useful than equivalence - it tells you what you can DO"
    }
  },

  // TYPE COERCION
  {
    id: 12,
    section: "checking",
    type: "concept",
    title: "Type Coercion (Implicit Conversion)",
    content: {
      description: "Automatic conversion between types:",
      items: [
        { icon: "⬆️", text: "Widening/Promotion", detail: "int → float (no precision lost)" },
        { icon: "⬇️", text: "Narrowing", detail: "float → int (precision may be lost)" },
        { icon: "⚠️", text: "Danger", detail: "Implicit narrowing can cause subtle bugs" }
      ],
      examples: [
        { code: "int a = 5; float b = 2.5;\nfloat c = a + b;  // a coerced to float", safe: true },
        { code: "float x = 3.7;\nint y = x;  // Truncates to 3!", safe: false }
      ]
    },
    interactive: { type: "coercion" }
  },

  // CONVERSION VS COERCION VS CAST
  {
    id: 13,
    section: "checking",
    type: "concept",
    title: "Conversion vs Coercion vs Cast",
    content: {
      description: "Terminology for type changes:",
      items: [
        { icon: "🔄", text: "Coercion", detail: "IMPLICIT - compiler does it automatically" },
        { icon: "✋", text: "Conversion", detail: "EXPLICIT - programmer writes it" },
        { icon: "🎭", text: "Cast", detail: "C terminology for explicit conversion" }
      ],
      code: `// Coercion (implicit)
int a = 5;
double b = a;  // Compiler converts

// Conversion/Cast (explicit)  
double x = 3.14;
int y = (int)x;  // Programmer converts`
    }
  },

  // TYPE INFERENCE
  {
    id: 14,
    section: "inference",
    type: "concept",
    title: "Type Inference",
    content: {
      description: "Compiler deduces types without explicit annotations:",
      items: [
        { icon: "🔍", text: "Local Inference", detail: "Infer from initialization (auto x = 5;)" },
        { icon: "🌐", text: "Global Inference", detail: "Infer from usage throughout program" },
        { icon: "📝", text: "Benefits", detail: "Less verbose code, still type-safe" }
      ],
      code: `// C++11 auto
auto x = 42;        // int
auto y = 3.14;      // double
auto z = "hello";   // const char*

// Rust inference
let v = vec![1, 2, 3];  // Vec<i32>`
    },
    interactive: { type: "inference" }
  },

  // POLYMORPHISM OVERVIEW
  {
    id: 15,
    section: "polymorphism",
    type: "concept",
    title: "Polymorphism",
    content: {
      description: "Code that works with multiple types:",
      items: [
        { icon: "📋", text: "Ad-hoc (Overloading)", detail: "Same name, different implementations per type" },
        { icon: "⊂", text: "Subtype", detail: "Code works on type and all its subtypes" },
        { icon: "📐", text: "Parametric (Generics)", detail: "Code parameterized by type" }
      ]
    },
    interactive: { type: "polymorphism" }
  },

  // GENERICS
  {
    id: 16,
    section: "polymorphism",
    type: "concept",
    title: "Generics (Parametric Polymorphism)",
    content: {
      description: "Write code that works for any type:",
      items: [
        { icon: "📦", text: "Generic Containers", detail: "List<T>, Map<K,V>, Stack<T>" },
        { icon: "🔧", text: "Generic Functions", detail: "swap<T>(a, b), sort<T>(array)" },
        { icon: "✅", text: "Type Safety", detail: "Compiler checks at instantiation" }
      ],
      code: `// Java generic
class Box<T> {
    T value;
    T get() { return value; }
}
Box<Integer> intBox = new Box<>();
Box<String> strBox = new Box<>();`
    }
  },

  // DUCK TYPING
  {
    id: 17,
    section: "polymorphism",
    type: "concept",
    title: "Duck Typing",
    content: {
      description: '"If it walks like a duck and quacks like a duck..."',
      items: [
        { icon: "🦆", text: "Concept", detail: "Type determined by methods/properties, not declaration" },
        { icon: "🐍", text: "Dynamic Languages", detail: "Python, Ruby, JavaScript use this" },
        { icon: "⚡", text: "Flexibility", detail: "Any object with required methods will work" },
        { icon: "⚠️", text: "Risk", detail: "Errors only found at runtime" }
      ],
      code: `# Python duck typing
def make_sound(animal):
    animal.speak()  # Works if animal has speak()

class Dog:
    def speak(self): print("Woof!")
    
class Cat:
    def speak(self): print("Meow!")`
    }
  },

  // TYPE SAFETY
  {
    id: 18,
    section: "safety",
    type: "concept",
    title: "Type Safety",
    content: {
      description: "Preventing type-related errors and undefined behavior:",
      items: [
        { icon: "🛡️", text: "Memory Safety", detail: "No buffer overflows, use-after-free" },
        { icon: "🚫", text: "Null Safety", detail: "No null pointer dereferences (Option/Maybe types)" },
        { icon: "🔒", text: "Thread Safety", detail: "Type system prevents data races (Rust)" },
        { icon: "✓", text: "Exhaustiveness", detail: "Must handle all cases (pattern matching)" }
      ]
    }
  },

  // MODERN TYPE FEATURES
  {
    id: 19,
    section: "modern",
    type: "concept",
    title: "Modern Type System Features",
    content: {
      description: "Advanced features in modern languages:",
      items: [
        { icon: "❓", text: "Optional/Maybe Types", detail: "Explicit handling of null (Option<T>, T?)" },
        { icon: "📊", text: "Algebraic Data Types", detail: "Sum types (Result, Either) + product types" },
        { icon: "🎯", text: "Pattern Matching", detail: "Destructure and match on type structure" },
        { icon: "🏷️", text: "Type Aliases", detail: "NewType pattern for semantic types" },
        { icon: "📐", text: "Dependent Types", detail: "Types that depend on values (very advanced)" }
      ]
    }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 7 Summary",
    content: {
      sections: [
        {
          title: "Type Systems",
          points: [
            "Strong vs weak: safety guarantees",
            "Static vs dynamic: when checking happens",
            "Types enable optimization and documentation"
          ]
        },
        {
          title: "Type Checking",
          points: [
            "Name vs structural equivalence",
            "Coercion: implicit conversion",
            "Type inference: compiler deduces types"
          ]
        },
        {
          title: "Polymorphism",
          points: [
            "Overloading, subtyping, generics",
            "Duck typing in dynamic languages",
            "Modern: optionals, algebraic types"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Static vs Dynamic Demo
const StaticDynamicDemo = () => {
  const [mode, setMode] = useState('static');

  const examples = {
    static: {
      code: `// Java (Static Typing)
int x = 5;        // x is always int
x = "hello";      // ERROR at compile time!

String s = "hi";
s = 42;           // ERROR at compile time!`,
      error: "Compile Error: incompatible types",
      when: "Error caught BEFORE running"
    },
    dynamic: {
      code: `# Python (Dynamic Typing)
x = 5           # x is int now
x = "hello"     # x is string now - OK!

def add(a, b):
    return a + b
    
add(1, 2)       # Works: 3
add("a", "b")   # Works: "ab"
add(1, "2")     # Runtime error!`,
      error: "TypeError: unsupported operand type(s)",
      when: "Error caught WHEN code runs"
    }
  };

  const current = examples[mode];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Static vs Dynamic Typing</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setMode('static')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${mode === 'static' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Static (Java)
        </button>
        <button onClick={() => setMode('dynamic')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${mode === 'dynamic' ? 'bg-green-500 text-white' : 'bg-slate-700'}`}>
          Dynamic (Python)
        </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-6">
        <pre className="text-green-400 font-mono text-lg whitespace-pre-wrap">{current.code}</pre>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-500/20 p-4 rounded-lg">
          <div className="text-red-400 font-bold text-lg mb-2">Error</div>
          <div className="text-white font-mono">{current.error}</div>
        </div>
        <div className={`p-4 rounded-lg ${mode === 'static' ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
          <div className={`font-bold text-lg mb-2 ${mode === 'static' ? 'text-blue-400' : 'text-amber-400'}`}>When Caught</div>
          <div className="text-white">{current.when}</div>
        </div>
      </div>
    </div>
  );
};

// Typing Grid Demo
const TypingGridDemo = () => {
  const [selected, setSelected] = useState(null);

  const languages = [
    { name: 'Java', strong: true, static: true, x: 0, y: 0 },
    { name: 'Python', strong: true, static: false, x: 1, y: 0 },
    { name: 'C', strong: false, static: true, x: 0, y: 1 },
    { name: 'JavaScript', strong: false, static: false, x: 1, y: 1 },
    { name: 'Haskell', strong: true, static: true, x: 0, y: 0 },
    { name: 'Rust', strong: true, static: true, x: 0, y: 0 },
    { name: 'Ruby', strong: true, static: false, x: 1, y: 0 }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Type System Quadrant</div>
      
      <div className="relative bg-slate-900 rounded-lg p-8" style={{ height: '320px' }}>
        {/* Axes */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-lg">Strong</div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-400 text-lg">Weak</div>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">Static</div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">Dynamic</div>
        
        {/* Grid lines */}
        <div className="absolute left-1/2 top-8 bottom-8 w-px bg-slate-700"></div>
        <div className="absolute top-1/2 left-8 right-8 h-px bg-slate-700"></div>
        
        {/* Quadrant labels */}
        <div className="absolute top-12 left-12 text-blue-400 text-base">Strong + Static</div>
        <div className="absolute top-12 right-12 text-green-400 text-base">Strong + Dynamic</div>
        <div className="absolute bottom-12 left-12 text-orange-400 text-base">Weak + Static</div>
        <div className="absolute bottom-12 right-12 text-red-400 text-base">Weak + Dynamic</div>
        
        {/* Language dots */}
        {languages.map((lang, i) => {
          const baseX = lang.static ? 25 : 75;
          const baseY = lang.strong ? 25 : 75;
          // Add small offset for same-quadrant languages
          const offset = i * 5;
          
          return (
            <button
              key={lang.name}
              onClick={() => setSelected(lang.name)}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                selected === lang.name ? 'scale-125 z-10' : ''
              } ${
                lang.strong && lang.static ? 'bg-blue-500' :
                lang.strong && !lang.static ? 'bg-green-500' :
                !lang.strong && lang.static ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{
                left: `calc(${baseX}% + ${(i % 3) * 20 - 20}px)`,
                top: `calc(${baseY}% + ${Math.floor(i / 3) * 15}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {lang.name.slice(0, 2)}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 bg-indigo-500/20 p-4 rounded-lg text-center">
          <span className="text-indigo-400 text-xl font-bold">{selected}</span>
          <span className="text-slate-300 text-lg ml-3">
            {languages.find(l => l.name === selected)?.strong ? 'Strong' : 'Weak'} + 
            {languages.find(l => l.name === selected)?.static ? ' Static' : ' Dynamic'}
          </span>
        </div>
      )}
    </div>
  );
};

// Type Equivalence Demo
const EquivalenceDemo = () => {
  const [mode, setMode] = useState('name');

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Name vs Structural Equivalence</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setMode('name')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${mode === 'name' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Name Equivalence
        </button>
        <button onClick={() => setMode('structural')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${mode === 'structural' ? 'bg-green-500 text-white' : 'bg-slate-700'}`}>
          Structural Equivalence
        </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-6">
        <pre className="text-green-400 font-mono text-lg">{`type Age = int
type Year = int

var personAge: Age = 25
var birthYear: Year = 1999

// Can we assign?
birthYear = personAge`}</pre>
      </div>

      <div className={`p-5 rounded-lg ${mode === 'name' ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
        {mode === 'name' ? (
          <div>
            <div className="text-red-400 text-2xl font-bold mb-2">❌ ERROR</div>
            <div className="text-white text-xl">Age and Year are different names → different types</div>
            <div className="text-slate-400 text-lg mt-2">This catches logical errors: ages and years shouldn't mix!</div>
          </div>
        ) : (
          <div>
            <div className="text-green-400 text-2xl font-bold mb-2">✓ OK</div>
            <div className="text-white text-xl">Both Age and Year are int → same structure → compatible</div>
            <div className="text-slate-400 text-lg mt-2">More permissive, but may allow unintended assignments</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Coercion Demo
const CoercionDemo = () => {
  const [intVal, setIntVal] = useState(5);
  const [floatVal, setFloatVal] = useState(3.7);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Type Coercion</div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-slate-400 text-lg">int value: {intVal}</label>
          <input type="range" min="0" max="100" value={intVal}
            onChange={(e) => setIntVal(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg bg-slate-700" />
        </div>
        <div>
          <label className="text-slate-400 text-lg">float value: {floatVal.toFixed(1)}</label>
          <input type="range" min="0" max="100" step="0.1" value={floatVal}
            onChange={(e) => setFloatVal(parseFloat(e.target.value))}
            className="w-full h-3 rounded-lg bg-slate-700" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-500/20 p-4 rounded-lg">
          <div className="text-green-400 font-bold text-lg">Widening (safe)</div>
          <div className="text-white font-mono text-xl mt-2">
            int → float: {intVal} → {intVal}.0
          </div>
          <div className="text-slate-400 text-base mt-1">No precision lost</div>
        </div>

        <div className="bg-amber-500/20 p-4 rounded-lg">
          <div className="text-amber-400 font-bold text-lg">Narrowing (dangerous)</div>
          <div className="text-white font-mono text-xl mt-2">
            float → int: {floatVal.toFixed(1)} → {Math.floor(floatVal)}
          </div>
          <div className="text-slate-400 text-base mt-1">Truncated! Lost: {(floatVal - Math.floor(floatVal)).toFixed(1)}</div>
        </div>

        <div className="bg-blue-500/20 p-4 rounded-lg">
          <div className="text-blue-400 font-bold text-lg">Mixed arithmetic (coercion)</div>
          <div className="text-white font-mono text-xl mt-2">
            {intVal} + {floatVal.toFixed(1)} = {(intVal + floatVal).toFixed(1)}
          </div>
          <div className="text-slate-400 text-base mt-1">int coerced to float, then added</div>
        </div>
      </div>
    </div>
  );
};

// Type Inference Demo
const InferenceDemo = () => {
  const examples = [
    { code: 'auto x = 42;', inferred: 'int', reason: 'Integer literal' },
    { code: 'auto y = 3.14;', inferred: 'double', reason: 'Floating-point literal' },
    { code: 'auto s = "hello";', inferred: 'const char*', reason: 'String literal' },
    { code: 'auto v = {1, 2, 3};', inferred: 'initializer_list<int>', reason: 'Braced initializer' },
    { code: 'auto f = []() { return 5; };', inferred: 'lambda', reason: 'Lambda expression' }
  ];

  const [selected, setSelected] = useState(0);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Type Inference (C++ auto)</div>
      
      <div className="space-y-2 mb-6">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-4 rounded-lg font-mono text-lg ${
              selected === i ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {ex.code}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-base">Inferred Type</div>
            <div className="text-indigo-400 text-2xl font-mono font-bold">{examples[selected].inferred}</div>
          </div>
          <div>
            <div className="text-slate-400 text-base">Why?</div>
            <div className="text-white text-xl">{examples[selected].reason}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Polymorphism Demo
const PolymorphismDemo = () => {
  const [type, setType] = useState('adhoc');

  const examples = {
    adhoc: {
      name: 'Ad-hoc (Overloading)',
      code: `// Same name, different implementations
int add(int a, int b) { return a + b; }
float add(float a, float b) { return a + b; }
string add(string a, string b) { return a + b; }

add(1, 2)       // Calls int version
add(1.5, 2.5)   // Calls float version  
add("a", "b")   // Calls string version`,
      description: 'Compiler picks implementation based on argument types'
    },
    subtype: {
      name: 'Subtype',
      code: `class Animal { void speak(); }
class Dog extends Animal { void speak() { bark(); } }
class Cat extends Animal { void speak() { meow(); } }

void makeSound(Animal a) {
    a.speak();  // Works for Dog, Cat, any Animal
}`,
      description: 'Code works on base type and all subtypes'
    },
    parametric: {
      name: 'Parametric (Generics)',
      code: `// One implementation for ALL types
<T> T identity(T x) { return x; }

identity(5)       // Works with int
identity("hi")    // Works with string
identity(dog)     // Works with any type`,
      description: 'Single implementation parameterized by type'
    }
  };

  const current = examples[type];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-indigo-400 text-lg mb-4 font-mono">Interactive: Types of Polymorphism</div>
      
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {Object.entries(examples).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`px-4 py-2 rounded-lg text-lg ${type === key ? 'bg-indigo-500 text-white' : 'bg-slate-700'}`}
          >
            {val.name}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-4">
        <pre className="text-green-400 font-mono text-base whitespace-pre-wrap">{current.code}</pre>
      </div>

      <div className="bg-indigo-500/20 p-4 rounded-lg">
        <div className="text-indigo-400 text-xl">{current.description}</div>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🏷️</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-indigo-400 mb-10">{slide.content.subtitle}</h2>}
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
          <div key={i} className={`p-4 rounded-lg ${ex.safe ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <code className={`font-mono text-lg ${ex.safe ? 'text-green-400' : 'text-red-400'}`}>{ex.code}</code>
          </div>
        ))}
      </div>
    )}
    {slide.content.code && (
      <div className="mt-6 bg-slate-900 p-5 rounded-lg">
        <pre className="text-green-400 font-mono text-lg whitespace-pre-wrap">{slide.content.code}</pre>
      </div>
    )}
    {slide.content.note && <p className="mt-6 text-indigo-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'equivalence' && <EquivalenceDemo />}
    {slide.interactive?.type === 'coercion' && <CoercionDemo />}
    {slide.interactive?.type === 'inference' && <InferenceDemo />}
    {slide.interactive?.type === 'polymorphism' && <PolymorphismDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-green-400'}`}>{a.name}</h3>
          {a.code && <pre className="text-green-400 font-mono text-base mb-3 bg-slate-900 p-3 rounded">{a.code}</pre>}
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
    {slide.content.note && <p className="mt-6 text-indigo-400 text-xl italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'static-dynamic' && <StaticDynamicDemo />}
  </div>
);

const TableSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-xl">
        <thead>
          <tr className="border-b border-slate-700">
            {slide.content.headers?.map((h, i) => (
              <th key={i} className="text-left p-4 text-indigo-400 font-bold text-2xl">{h}</th>
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
    {slide.interactive?.type === 'typing-grid' && <TypingGridDemo />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-indigo-400 font-bold text-2xl mb-5">{section.title}</h3>
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
    case 'table': return <TableSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter7Slides({ onBackToChapters }) {
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
            <span className="text-indigo-400 font-bold text-lg">Ch 7: {CHAPTER_CONFIG.title}</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 7 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-indigo-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-indigo-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded text-lg disabled:opacity-30">
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

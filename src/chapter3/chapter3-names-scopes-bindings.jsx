import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 3: NAMES, SCOPES, AND BINDINGS
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 3,
  title: "Names, Scopes, and Bindings",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#06b6d4" // cyan
};

// ============================================================================
// SLIDE DATA
// ============================================================================
const SLIDES = [
  // TITLE SLIDE
  {
    id: 1,
    section: "intro",
    type: "title",
    title: "Chapter 3: Names, Scopes, and Bindings",
    content: {
      subtitle: "The Foundation of Program Organization",
      topics: [
        "Names and Bindings",
        "Binding Time",
        "Lifetime and Storage",
        "Scope Rules",
        "Static vs Dynamic Scope",
        "Referencing Environments"
      ]
    }
  },

  // CORE CONCEPTS
  {
    id: 2,
    section: "basics",
    type: "definition",
    title: "Fundamental Concepts",
    content: {
      definition: "Three core concepts underpin all naming in programming languages:",
      items: [
        { 
          term: "Name", 
          definition: "An identifier or symbol used to refer to an entity",
          example: "x, printf, +, MyClass"
        },
        { 
          term: "Binding", 
          definition: "An association between two things (e.g., name ↔ object)",
          example: "int x = 5 binds 'x' to a memory location"
        },
        { 
          term: "Scope", 
          definition: "The textual region where a binding is active",
          example: "Local variables are scoped to their function"
        }
      ]
    }
  },

  // BINDING TIME
  {
    id: 3,
    section: "binding",
    type: "timeline",
    title: "Binding Time",
    content: {
      description: "The point at which a binding is created or an implementation decision is made:",
      timeline: [
        { time: "Language Design", decisions: "Syntax, keywords, operators", example: "'+' means addition" },
        { time: "Language Implementation", decisions: "I/O behavior, overflow handling", example: "Integer size = 32 bits" },
        { time: "Program Writing", decisions: "Algorithms, variable names", example: "Using 'count' for counter" },
        { time: "Compile Time", decisions: "Data layout, type checking", example: "Variable offsets in stack" },
        { time: "Link Time", decisions: "Memory layout of whole program", example: "Library function addresses" },
        { time: "Load Time", decisions: "Physical memory addresses", example: "Base address assignment" },
        { time: "Run Time", decisions: "Variable values, dynamic sizes", example: "x = user_input()" }
      ]
    },
    interactive: { type: "binding-time" }
  },

  // STATIC VS DYNAMIC
  {
    id: 4,
    section: "binding",
    type: "comparison",
    title: "Static vs Dynamic Binding",
    content: {
      comparison: [
        {
          name: "Static (Early) Binding",
          description: "Decisions made before run time",
          characteristics: [
            "Determined at compile/link time",
            "Greater efficiency",
            "Less flexibility",
            "Typical of compiled languages"
          ],
          examples: "C, C++, Java (for types), Go"
        },
        {
          name: "Dynamic (Late) Binding",
          description: "Decisions made at run time",
          characteristics: [
            "Determined during execution",
            "Greater flexibility",
            "Runtime overhead",
            "Typical of interpreted languages"
          ],
          examples: "Python, JavaScript, Ruby, Lisp"
        }
      ],
      insight: "Early binding → Efficiency | Late binding → Flexibility"
    }
  },

  // KEY EVENTS IN LIFETIME
  {
    id: 5,
    section: "lifetime",
    type: "concept",
    title: "Object and Binding Lifetime",
    content: {
      description: "Key events in the life of objects and bindings:",
      items: [
        { icon: "🎬", text: "Creation of objects", detail: "Memory allocation" },
        { icon: "🔗", text: "Creation of bindings", detail: "Name associated with object" },
        { icon: "👁️", text: "References to variables", detail: "Using bindings to access data" },
        { icon: "⏸️", text: "Deactivation of bindings", detail: "Temporarily hidden (e.g., shadowing)" },
        { icon: "▶️", text: "Reactivation of bindings", detail: "Restored after inner scope exits" },
        { icon: "💔", text: "Destruction of bindings", detail: "Name no longer refers to object" },
        { icon: "🗑️", text: "Destruction of objects", detail: "Memory deallocated" }
      ]
    }
  },

  // LIFETIME PROBLEMS
  {
    id: 6,
    section: "lifetime",
    type: "problem",
    title: "Lifetime Mismatches",
    content: {
      problems: [
        {
          name: "Garbage",
          condition: "Object outlives its binding",
          description: "Memory allocated but unreachable",
          example: "Lost pointer to malloc'd memory in C",
          solution: "Garbage collection or careful manual management",
          color: "yellow"
        },
        {
          name: "Dangling Reference",
          condition: "Binding outlives its object",
          description: "Name refers to deallocated memory",
          example: "Pointer to freed memory, returning address of local",
          solution: "Smart pointers, ownership systems (Rust)",
          color: "red"
        }
      ]
    },
    interactive: { type: "lifetime-demo" }
  },

  // STORAGE ALLOCATION
  {
    id: 7,
    section: "storage",
    type: "comparison",
    title: "Storage Allocation Mechanisms",
    content: {
      approaches: [
        {
          name: "Static Allocation",
          pros: ["Fast access (fixed address)", "No runtime overhead", "Simple"],
          cons: ["Fixed size", "No recursion support", "Wastes space if unused"],
          uses: "Global variables, constants, static variables, code"
        },
        {
          name: "Stack Allocation",
          pros: ["Automatic management", "Supports recursion", "Efficient reuse"],
          cons: ["LIFO order only", "Size limits", "No dynamic lifetime"],
          uses: "Local variables, parameters, return addresses"
        },
        {
          name: "Heap Allocation",
          pros: ["Dynamic size", "Arbitrary lifetime", "Flexible"],
          cons: ["Slower allocation", "Fragmentation", "Requires GC or manual free"],
          uses: "Dynamic data structures, objects with variable lifetime"
        }
      ]
    },
    interactive: { type: "memory-layout" }
  },

  // STACK FRAME
  {
    id: 8,
    section: "storage",
    type: "diagram",
    title: "Stack Frame (Activation Record)",
    content: {
      description: "Contents of a typical stack frame:",
      components: [
        { name: "Arguments", description: "Parameters passed to function", offset: "positive from FP" },
        { name: "Return Address", description: "Where to return after call", offset: "saved PC" },
        { name: "Dynamic Link", description: "Pointer to caller's frame", offset: "saved FP" },
        { name: "Static Link", description: "Pointer to enclosing scope (for nested functions)", offset: "optional" },
        { name: "Saved Registers", description: "Caller/callee saved registers", offset: "varies" },
        { name: "Local Variables", description: "Function's local data", offset: "negative from FP" },
        { name: "Temporaries", description: "Expression evaluation space", offset: "below locals" }
      ],
      note: "Local variables have fixed offsets from frame pointer (FP), determined at compile time"
    },
    interactive: { type: "stack-frame" }
  },

  // WHY A STACK?
  {
    id: 9,
    section: "storage",
    type: "concept",
    title: "Why Use a Stack?",
    content: {
      description: "The stack is fundamental for two reasons:",
      items: [
        { 
          icon: "🔄", 
          text: "Recursion Support", 
          detail: "Each call gets its own frame with its own locals. Without a stack (like old FORTRAN), recursion is impossible." 
        },
        { 
          icon: "♻️", 
          text: "Space Reuse", 
          detail: "When a function returns, its space is immediately available for the next call. Efficient memory usage." 
        }
      ],
      historical: "FORTRAN (pre-77) had no recursion because it used static allocation for all variables!"
    }
  },

  // SCOPE RULES INTRO
  {
    id: 10,
    section: "scope",
    type: "definition",
    title: "Scope Rules",
    content: {
      definition: "Rules that determine which binding a name refers to:",
      items: [
        { 
          term: "Scope", 
          definition: "A program region where no bindings change (or no re-declarations occur)",
          example: "Function body, block, module"
        },
        { 
          term: "Open Scope", 
          definition: "On entry: create bindings for locals, deactivate re-declared globals",
          example: "Entering a function"
        },
        { 
          term: "Close Scope", 
          definition: "On exit: destroy local bindings, reactivate hidden globals",
          example: "Returning from a function"
        },
        { 
          term: "Hole in Scope", 
          definition: "Region where an outer binding is hidden by an inner declaration",
          example: "Local 'x' hides global 'x'"
        }
      ]
    }
  },

  // STATIC SCOPE
  {
    id: 11,
    section: "scope",
    type: "concept",
    title: "Static (Lexical) Scope",
    content: {
      description: "Scope determined by the physical structure of the program text:",
      items: [
        { icon: "📖", text: "Lexical Structure", detail: "Bindings resolved by examining program text" },
        { icon: "🔍", text: "Compile-Time Resolution", detail: "All references resolved before execution" },
        { icon: "📐", text: "Most Closely Nested Rule", detail: "Look in current scope, then enclosing scopes" },
        { icon: "✅", text: "Predictable", detail: "Can determine binding by reading code" }
      ],
      languages: "C, C++, Java, Python, Pascal, Ada, most modern languages"
    }
  },

  // DYNAMIC SCOPE
  {
    id: 12,
    section: "scope",
    type: "concept",
    title: "Dynamic Scope",
    content: {
      description: "Scope determined by the runtime calling sequence:",
      items: [
        { icon: "⏱️", text: "Runtime Resolution", detail: "Bindings depend on execution path" },
        { icon: "📞", text: "Calling Sequence", detail: "Look in current activation, then caller's, then caller's caller..." },
        { icon: "🎭", text: "Context-Dependent", detail: "Same code may access different variables" },
        { icon: "⚠️", text: "Harder to Reason About", detail: "Cannot determine binding without tracing execution" }
      ],
      languages: "Early Lisp, Bash, Emacs Lisp, Perl (with 'local')",
      note: "Generally considered bad practice today - implicit parameter passing"
    }
  },

  // STATIC VS DYNAMIC EXAMPLE
  {
    id: 13,
    section: "scope",
    type: "interactive",
    title: "Static vs Dynamic Scope Example",
    content: {
      code: `var a : integer;     // global a

procedure first;
begin
  a := 1;            // which 'a'?
end;

procedure second;
var a : integer;     // local a
begin
  first;             // calls first
end;

begin                // main
  a := 2;            // global a = 2
  second;            // call second
  write(a);          // output: ???
end.`,
      question: "What does write(a) output?"
    },
    interactive: { type: "scope-demo" }
  },

  // SCOPE RESOLUTION DETAIL
  {
    id: 14,
    section: "scope",
    type: "walkthrough",
    title: "Scope Resolution Walkthrough",
    content: {
      intro: "Tracing the execution with both scope rules:",
      steps: [
        { 
          step: "1. Main starts", 
          static: "global a created", 
          dynamic: "global a created" 
        },
        { 
          step: "2. a := 2", 
          static: "global a = 2", 
          dynamic: "global a = 2" 
        },
        { 
          step: "3. Call second", 
          static: "second's local a created (uninitialized)", 
          dynamic: "second's local a created" 
        },
        { 
          step: "4. second calls first", 
          static: "first sees global a (lexically enclosing)", 
          dynamic: "first sees second's a (most recent on call stack)" 
        },
        { 
          step: "5. a := 1 in first", 
          static: "global a = 1", 
          dynamic: "second's local a = 1" 
        },
        { 
          step: "6. first returns", 
          static: "no change", 
          dynamic: "no change" 
        },
        { 
          step: "7. second returns", 
          static: "second's local destroyed", 
          dynamic: "second's local (with value 1) destroyed" 
        },
        { 
          step: "8. write(a)", 
          static: "outputs 1 (global was modified)", 
          dynamic: "outputs 2 (global unchanged)" 
        }
      ]
    },
    interactive: { type: "scope-trace" }
  },

  // STATIC LINKS
  {
    id: 15,
    section: "scope",
    type: "concept",
    title: "Static Links for Nested Scopes",
    content: {
      description: "How to access non-local variables in statically scoped languages with nested functions:",
      items: [
        { icon: "🔗", text: "Static Link", detail: "Each frame points to the frame of its lexically enclosing routine" },
        { icon: "🔢", text: "Nesting Depth", detail: "Count static links to follow: k levels out = k links" },
        { icon: "📍", text: "Fixed Offset", detail: "Variable offset within frame known at compile time" }
      ],
      example: {
        code: `procedure A;
  var x: integer;
  procedure B;
    procedure C;
    begin
      x := 1;  // x is 2 levels out
    end;
  begin C; end;
begin B; end;`,
        explanation: "C's frame → B's frame → A's frame, then use x's offset"
      }
    }
  },

  // ACCESSING NON-LOCAL VARIABLES
  {
    id: 16,
    section: "scope",
    type: "diagram",
    title: "Accessing Non-Local Variables",
    content: {
      description: "Two approaches for dynamic scope implementation:",
      approaches: [
        {
          name: "Association List (Deep Binding)",
          how: "Stack of (name, value) pairs for all active variables",
          lookup: "Search from top of stack",
          tradeoff: "Slow access, fast call/return"
        },
        {
          name: "Central Table (Shallow Binding)",
          how: "Hash table with one slot per variable name",
          lookup: "Direct table lookup",
          tradeoff: "Fast access, slow call/return (must save/restore)"
        }
      ],
      comparison: "Static scope lookup at compile time ↔ Dynamic scope lookup at runtime"
    }
  },

  // ALIASING
  {
    id: 17,
    section: "meaning",
    type: "concept",
    title: "Aliasing",
    content: {
      description: "When two or more names refer to the same object:",
      items: [
        { icon: "💾", text: "Space Saving", detail: "FORTRAN EQUIVALENCE - now obsolete" },
        { icon: "🔄", text: "Multiple Representations", detail: "Unions are a better solution" },
        { icon: "🔗", text: "Linked Structures", detail: "Legitimate use - multiple pointers to same node" },
        { icon: "📞", text: "Parameter Passing", detail: "Unfortunate side effect of pass-by-reference" }
      ],
      problems: [
        "Complicates optimization (compiler can't assume independence)",
        "Makes reasoning about correctness harder",
        "Euclid language designed to prevent aliasing"
      ]
    },
    interactive: { type: "alias-demo" }
  },

  // OVERLOADING
  {
    id: 18,
    section: "meaning",
    type: "concept",
    title: "Overloading",
    content: {
      description: "Same name refers to different operations based on context:",
      items: [
        { icon: "➕", text: "Operator Overloading", detail: "int + vs float + vs string +" },
        { icon: "📖", text: "Built-in Overloading", detail: "read/write in Pascal work with many types" },
        { icon: "🔧", text: "User-Defined", detail: "C++, Ada allow defining overloaded functions" }
      ],
      distinction: [
        { term: "Overloading", definition: "Same name, different implementations", example: "int norm(int) vs complex norm(complex)" },
        { term: "Polymorphism", definition: "One implementation, works on multiple types", example: "min(array of T) for any T" },
        { term: "Generics", definition: "Template instantiated at compile time", example: "vector<int> vs vector<string>" }
      ]
    }
  },

  // REFERENCING ENVIRONMENTS
  {
    id: 19,
    section: "environment",
    type: "definition",
    title: "Referencing Environments",
    content: {
      definition: "Key concepts for understanding how names are resolved:",
      items: [
        { 
          term: "Referencing Environment", 
          definition: "The set of all active bindings at a given point",
          example: "All variables accessible at line 42"
        },
        { 
          term: "Scope Rules", 
          definition: "Determine WHICH scopes to examine and in what order",
          example: "Local → Enclosing → Global"
        },
        { 
          term: "Binding Rules", 
          definition: "Determine WHICH INSTANCE of a scope to use",
          example: "Important when passing functions as parameters"
        }
      ]
    }
  },

  // CLOSURES
  {
    id: 20,
    section: "environment",
    type: "concept",
    title: "Closures and First-Class Functions",
    content: {
      description: "When functions can be passed as parameters or returned:",
      items: [
        { icon: "📦", text: "Closure", detail: "Function + its referencing environment at creation time" },
        { icon: "🎒", text: "Captured Variables", detail: "Free variables bound when closure is created" },
        { icon: "⏳", text: "Lifetime Extension", detail: "Captured variables may outlive their original scope" }
      ],
      example: {
        code: `function makeCounter() {
  let count = 0;
  return function() {
    count += 1;
    return count;
  };
}
let c = makeCounter();
c(); // returns 1
c(); // returns 2`,
        explanation: "Inner function 'closes over' count variable"
      }
    },
    interactive: { type: "closure-demo" }
  },

  // SEPARATE COMPILATION
  {
    id: 21,
    section: "separate",
    type: "concept",
    title: "Separate Compilation",
    content: {
      description: "C's approach to multi-file programs:",
      items: [
        { 
          icon: "🔒", 
          text: "static (file scope)", 
          detail: "Visible only in current file - internal linkage" 
        },
        { 
          icon: "🌍", 
          text: "extern", 
          detail: "Declared elsewhere - external linkage" 
        },
        { 
          icon: "📢", 
          text: "Default (global)", 
          detail: "Visible everywhere if not static" 
        }
      ],
      note: "C's static keyword has TWO meanings: file-scope visibility AND persistent lifetime inside functions"
    }
  },

  // C STATIC EXAMPLE
  {
    id: 22,
    section: "separate",
    type: "code",
    title: "C's Two Meanings of 'static'",
    content: {
      code: `// file1.c
static int hidden = 10;     // Only visible in file1.c

int visible = 20;           // Visible everywhere (extern by default)

void count() {
    static int calls = 0;   // Persistent across calls
    calls++;
    printf("Called %d times\\n", calls);
}

// file2.c
extern int visible;         // Refers to visible in file1.c
// Cannot access 'hidden' - it's static to file1.c`,
      explanation: [
        { label: "static (outside function)", meaning: "Internal linkage - file scope only" },
        { label: "static (inside function)", meaning: "Persistent lifetime - survives across calls" },
        { label: "extern", meaning: "External linkage - defined elsewhere" }
      ]
    }
  },

  // ELABORATION
  {
    id: 23,
    section: "advanced",
    type: "concept",
    title: "Elaboration",
    content: {
      description: "The process of creating bindings when entering a scope:",
      items: [
        { icon: "🎬", text: "Declaration Processing", detail: "Evaluate initializers, allocate space" },
        { icon: "📏", text: "Size Computation", detail: "For arrays with runtime bounds" },
        { icon: "🚀", text: "Task Creation", detail: "Ada can start tasks during elaboration" },
        { icon: "⚠️", text: "Exception Handling", detail: "Elaboration can raise exceptions" }
      ],
      languages: "Term popularized by Algol 68, used extensively in Ada"
    }
  },

  // MODULES AND ABSTRACT DATA TYPES
  {
    id: 24,
    section: "advanced",
    type: "concept",
    title: "Modules and Information Hiding",
    content: {
      description: "Modules provide closed scopes with controlled visibility:",
      items: [
        { icon: "📦", text: "Encapsulation", detail: "Group related code and data" },
        { icon: "🔐", text: "Information Hiding", detail: "Internal details not visible outside" },
        { icon: "⏳", text: "Extended Lifetime", detail: "Module-level bindings persist (unlike locals)" },
        { icon: "📤", text: "Controlled Export", detail: "Explicit interface defines what's visible" }
      ],
      evolution: [
        { stage: "Subroutines", feature: "Local scope" },
        { stage: "Static/Own", feature: "Persistent locals" },
        { stage: "Modules", feature: "Grouped scope with export" },
        { stage: "Classes", feature: "Module types + inheritance" }
      ]
    }
  },

  // SUMMARY
  {
    id: 25,
    section: "summary",
    type: "summary",
    title: "Chapter 3 Summary",
    content: {
      sections: [
        {
          title: "Names and Bindings",
          points: [
            "Binding associates names with entities",
            "Binding time affects flexibility vs efficiency",
            "Early binding → efficiency, Late binding → flexibility"
          ]
        },
        {
          title: "Lifetime and Storage",
          points: [
            "Static: fixed address, no recursion",
            "Stack: automatic, supports recursion",
            "Heap: dynamic, requires management"
          ]
        },
        {
          title: "Scope Rules",
          points: [
            "Static scope: determined by program text",
            "Dynamic scope: determined by call stack",
            "Static scope preferred in modern languages"
          ]
        },
        {
          title: "Advanced Topics",
          points: [
            "Aliasing complicates optimization",
            "Closures capture referencing environments",
            "Modules provide information hiding"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

const BindingTimeDemo = () => {
  const [selectedTime, setSelectedTime] = useState(null);
  
  const times = [
    { name: "Design Time", example: "'+' means addition", bound: "language" },
    { name: "Compile Time", example: "int x → offset 4", bound: "compiler" },
    { name: "Link Time", example: "printf → 0x401000", bound: "linker" },
    { name: "Load Time", example: "base addr → 0x7fff", bound: "loader" },
    { name: "Run Time", example: "x = input()", bound: "execution" }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Binding Time Spectrum</div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-green-400 text-sm">Early (Efficient)</span>
        <div className="flex-1 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 mx-4 rounded" />
        <span className="text-red-400 text-sm">Late (Flexible)</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {times.map((t, i) => (
          <button
            key={i}
            onClick={() => setSelectedTime(i)}
            className={`p-3 rounded-lg text-center transition-all ${
              selectedTime === i 
                ? 'bg-cyan-500 text-white scale-105' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="text-xs font-bold">{t.name}</div>
          </button>
        ))}
      </div>
      {selectedTime !== null && (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <div className="text-cyan-400 font-bold">{times[selectedTime].name}</div>
          <div className="text-white mt-2">Example: <code className="text-green-400">{times[selectedTime].example}</code></div>
          <div className="text-slate-400 mt-1">Determined by: {times[selectedTime].bound}</div>
        </div>
      )}
    </div>
  );
};

const LifetimeDemo = () => {
  const [scenario, setScenario] = useState('normal');
  
  const scenarios = {
    normal: {
      title: "Normal Operation",
      binding: "Active",
      object: "Exists",
      status: "✓ Healthy",
      color: "green"
    },
    garbage: {
      title: "Garbage (Memory Leak)",
      binding: "Destroyed",
      object: "Still Exists",
      status: "⚠ Unreachable memory",
      color: "yellow"
    },
    dangling: {
      title: "Dangling Reference",
      binding: "Still Active",
      object: "Destroyed",
      status: "✗ Crash risk!",
      color: "red"
    }
  };

  const s = scenarios[scenario];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Lifetime Mismatches</div>
      <div className="flex gap-2 mb-4">
        {Object.keys(scenarios).map(key => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={`px-4 py-2 rounded transition-all ${
              scenario === key 
                ? `bg-${scenarios[key].color}-500 text-white` 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {scenarios[key].title}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className={`p-6 rounded-lg border-2 ${
          s.binding === 'Active' ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-900'
        }`}>
          <div className="text-slate-400 text-sm">Binding (Name)</div>
          <div className="text-xl font-bold text-white">{s.binding}</div>
        </div>
        <div className={`p-6 rounded-lg border-2 ${
          s.object === 'Exists' ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-900'
        }`}>
          <div className="text-slate-400 text-sm">Object (Memory)</div>
          <div className="text-xl font-bold text-white">{s.object}</div>
        </div>
      </div>
      <div className={`mt-4 p-6 rounded-lg text-center text-lg font-bold ${
        s.color === 'green' ? 'bg-green-500/20 text-green-400' :
        s.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {s.status}
      </div>
    </div>
  );
};

const MemoryLayoutDemo = () => {
  const [highlight, setHighlight] = useState(null);
  
  const regions = [
    { name: "Stack", color: "blue", items: ["Local vars", "Parameters", "Return addr"], grows: "↓" },
    { name: "↕ Free", color: "slate", items: ["Available memory"], grows: "" },
    { name: "Heap", color: "green", items: ["malloc'd data", "Objects", "Dynamic arrays"], grows: "↑" },
    { name: "Static/BSS", color: "yellow", items: ["Global vars", "Static vars"], grows: "" },
    { name: "Code", color: "purple", items: ["Instructions", "Constants"], grows: "" }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Memory Layout</div>
      <div className="flex gap-5">
        <div className="w-48 space-y-1">
          {regions.map((r, i) => (
            <div
              key={i}
              onClick={() => setHighlight(i)}
              className={`p-3 rounded cursor-pointer transition-all ${
                highlight === i 
                  ? `bg-${r.color}-500 text-white` 
                  : `bg-${r.color}-500/20 text-${r.color}-400 hover:bg-${r.color}-500/40`
              }`}
            >
              <div className="font-bold flex justify-between">
                <span>{r.name}</span>
                {r.grows && <span>{r.grows}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-slate-900 p-6 rounded-lg">
          {highlight !== null ? (
            <>
              <div className="text-lg font-bold text-white mb-2">{regions[highlight].name}</div>
              <ul className="space-y-1">
                {regions[highlight].items.map((item, i) => (
                  <li key={i} className="text-slate-300">• {item}</li>
                ))}
              </ul>
              {regions[highlight].grows && (
                <div className="mt-3 text-slate-400">
                  Grows: {regions[highlight].grows === '↓' ? 'downward (toward heap)' : 'upward (toward stack)'}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500">Click a memory region to learn more</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StackFrameDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { 
      title: "Before Call", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }],
      action: "main() is executing"
    },
    { 
      title: "Push Arguments", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }, { name: "foo args", vars: ["arg1=5"] }],
      action: "Push argument for foo(x)"
    },
    { 
      title: "Save Return Address", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }, { name: "foo", vars: ["arg1=5", "ret=main+42"] }],
      action: "Save where to return"
    },
    { 
      title: "Allocate Locals", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }, { name: "foo", vars: ["arg1=5", "ret=main+42", "local=0"] }],
      action: "foo's local variables"
    },
    { 
      title: "foo() Executes", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }, { name: "foo", vars: ["arg1=5", "ret=main+42", "local=100"] }],
      action: "foo modifies its locals"
    },
    { 
      title: "Return", 
      frames: [{ name: "main", vars: ["x=5", "y=10"] }],
      action: "Pop foo's frame, return to main"
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Stack Frame Lifecycle</div>
      <div className="flex gap-5">
        <div className="w-48">
          <div className="text-slate-400 text-xs mb-2">Stack (grows ↓)</div>
          <div className="space-y-1">
            {current.frames.map((frame, i) => (
              <div key={i} className={`p-2 rounded ${i === current.frames.length - 1 ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                <div className="font-bold text-white text-sm">{frame.name}</div>
                {frame.vars.map((v, j) => (
                  <div key={j} className="text-xs text-slate-300 ml-2">{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-slate-900 p-6 rounded-lg mb-4">
            <div className="text-lg font-bold text-white">{current.title}</div>
            <div className="text-slate-300 mt-2">{current.action}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
            <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}
              className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
            <button onClick={() => setStep(0)} className="px-5 py-2 bg-cyan-600 rounded text-base">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScopeDemo = () => {
  const [scopeType, setScopeType] = useState('static');
  const [step, setStep] = useState(0);
  
  const staticTrace = [
    { line: "a := 2 (main)", globalA: 2, secondA: "-", note: "Initialize global" },
    { line: "call second", globalA: 2, secondA: "?", note: "Enter second, create local a" },
    { line: "call first", globalA: 2, secondA: "?", note: "Enter first" },
    { line: "a := 1 (first)", globalA: 1, secondA: "?", note: "first modifies GLOBAL a (lexical)" },
    { line: "return to second", globalA: 1, secondA: "?", note: "Back in second" },
    { line: "return to main", globalA: 1, secondA: "-", note: "second's a destroyed" },
    { line: "write(a)", globalA: 1, secondA: "-", note: "Output: 1" }
  ];

  const dynamicTrace = [
    { line: "a := 2 (main)", globalA: 2, secondA: "-", note: "Initialize global" },
    { line: "call second", globalA: 2, secondA: "?", note: "Enter second, create local a" },
    { line: "call first", globalA: 2, secondA: "?", note: "Enter first" },
    { line: "a := 1 (first)", globalA: 2, secondA: 1, note: "first modifies SECOND's a (dynamic)" },
    { line: "return to second", globalA: 2, secondA: 1, note: "Back in second" },
    { line: "return to main", globalA: 2, secondA: "-", note: "second's a (with 1) destroyed" },
    { line: "write(a)", globalA: 2, secondA: "-", note: "Output: 2" }
  ];

  const trace = scopeType === 'static' ? staticTrace : dynamicTrace;
  const current = trace[step];

  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Static vs Dynamic Scope</div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setScopeType('static'); setStep(0); }}
          className={`px-4 py-2 rounded ${scopeType === 'static' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Static Scope
        </button>
        <button onClick={() => { setScopeType('dynamic'); setStep(0); }}
          className={`px-4 py-2 rounded ${scopeType === 'dynamic' ? 'bg-purple-500 text-white' : 'bg-slate-700'}`}>
          Dynamic Scope
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-5 mb-4">
        <div className="bg-slate-900 p-3 rounded">
          <div className="text-slate-500 text-sm">Executing</div>
          <div className="text-white font-mono">{current.line}</div>
        </div>
        <div className="bg-slate-900 p-3 rounded">
          <div className="text-slate-500 text-sm">Global a</div>
          <div className="text-2xl font-bold text-cyan-400">{current.globalA}</div>
        </div>
        <div className="bg-slate-900 p-3 rounded">
          <div className="text-slate-500 text-sm">second's local a</div>
          <div className="text-2xl font-bold text-amber-400">{current.secondA}</div>
        </div>
      </div>

      <div className={`p-6 rounded-lg mb-4 ${scopeType === 'static' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
        <div className="text-slate-300">{current.note}</div>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        {trace.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`w-3 h-3 rounded-full ${i === step ? 'bg-cyan-500' : i < step ? 'bg-green-500' : 'bg-slate-600'}`} />
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(Math.min(trace.length - 1, step + 1))} disabled={step >= trace.length - 1}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-50">Next →</button>
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-cyan-600 rounded text-base">Reset</button>
      </div>

      <div className={`mt-4 p-6 rounded-lg text-center text-2xl font-bold ${
        scopeType === 'static' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
      }`}>
        Output: {scopeType === 'static' ? '1' : '2'}
      </div>
    </div>
  );
};

const AliasDemo = () => {
  const [x, setX] = useState(10);
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Aliasing</div>
      <div className="bg-slate-900 p-6 rounded-lg mb-4 font-mono text-sm">
        <div className="text-slate-400">int x = {x};</div>
        <div className="text-slate-400">int* p = &x;  // p is alias for x</div>
        <div className="text-slate-400">int& r = x;   // r is alias for x</div>
      </div>
      <div className="grid grid-cols-3 gap-5 mb-4">
        <div className="bg-slate-900 p-4 rounded text-center">
          <div className="text-slate-500 text-sm">x</div>
          <div className="text-5xl font-bold text-white">{x}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded text-center">
          <div className="text-slate-500 text-sm">*p</div>
          <div className="text-3xl font-bold text-cyan-400">{x}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded text-center">
          <div className="text-slate-500 text-sm">r</div>
          <div className="text-3xl font-bold text-amber-400">{x}</div>
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setX(x + 1)} className="px-4 py-2 bg-slate-700 rounded">x++</button>
        <button onClick={() => setX(x + 10)} className="px-5 py-2 bg-cyan-600 rounded text-base">*p += 10</button>
        <button onClick={() => setX(x * 2)} className="px-4 py-2 bg-amber-600 rounded">r *= 2</button>
        <button onClick={() => setX(10)} className="px-4 py-2 bg-slate-600 rounded">Reset</button>
      </div>
      <div className="mt-4 text-center text-slate-400">
        All three names refer to the same memory location!
      </div>
    </div>
  );
};

const ClosureDemo = () => {
  const [counters, setCounters] = useState([0, 0]);
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 mt-4">
      <div className="text-cyan-400 text-base mb-4 font-mono">Interactive: Closures</div>
      <div className="bg-slate-900 p-6 rounded-lg mb-4 font-mono text-sm">
        <div className="text-green-400">function makeCounter() {'{'}</div>
        <div className="text-green-400 ml-4">let count = 0;</div>
        <div className="text-green-400 ml-4">return () =&gt; {'{ count++; return count; }'}</div>
        <div className="text-green-400">{'}'}</div>
        <div className="text-slate-400 mt-2">let counter1 = makeCounter();</div>
        <div className="text-slate-400">let counter2 = makeCounter();</div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-slate-900 p-4 rounded text-center">
          <div className="text-slate-500 text-sm mb-2">counter1's count</div>
          <div className="text-4xl font-bold text-cyan-400 mb-4">{counters[0]}</div>
          <button onClick={() => setCounters([counters[0] + 1, counters[1]])}
            className="px-5 py-2 bg-cyan-600 rounded text-base">counter1()</button>
        </div>
        <div className="bg-slate-900 p-4 rounded text-center">
          <div className="text-slate-500 text-sm mb-2">counter2's count</div>
          <div className="text-4xl font-bold text-amber-400 mb-4">{counters[1]}</div>
          <button onClick={() => setCounters([counters[0], counters[1] + 1])}
            className="px-4 py-2 bg-amber-600 rounded">counter2()</button>
        </div>
      </div>
      <div className="mt-4 text-center text-slate-400">
        Each closure has its own captured 'count' variable!
      </div>
      <button onClick={() => setCounters([0, 0])} className="mt-2 px-4 py-2 bg-slate-600 rounded block mx-auto">
        Reset Both
      </button>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-6xl mb-8">📚</div>
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-xl text-cyan-400 mb-8">{slide.content.subtitle}</h2>}
    <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl">
      {slide.content.topics?.map((t, i) => (
        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">{t}</span>
      ))}
    </div>
  </div>
);

const DefinitionSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.definition && <p className="text-3xl text-slate-300 mb-8">{slide.content.definition}</p>}
    <div className="space-y-5">
      {slide.content.items?.map((item, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-lg border-l-4 border-cyan-500">
          <div className="flex items-start gap-5">
            <span className="text-cyan-400 font-bold text-lg">{item.term || (i + 1)}</span>
            <div className="flex-1">
              <p className="text-white">{item.definition || item.text}</p>
              {item.example && <p className="text-slate-400 font-mono text-sm mt-2">Example: {item.example}</p>}
              {item.detail && <p className="text-slate-300 text-xl mt-1">{item.detail}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.content.description && <p className="text-slate-300 mb-8">{slide.content.description}</p>}
    <div className="space-y-2">
      {slide.content.timeline?.map((item, i) => (
        <div key={i} className="flex items-center gap-5 bg-slate-800/50 p-3 rounded-lg">
          <div className="w-40 text-cyan-400 font-bold text-sm">{item.time}</div>
          <div className="flex-1">
            <div className="text-white">{item.decisions}</div>
            <div className="text-slate-400 text-sm font-mono">{item.example}</div>
          </div>
        </div>
      ))}
    </div>
    {slide.interactive?.type === 'binding-time' && <BindingTimeDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.comparison && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slide.content.comparison.map((item, i) => (
          <div key={i} className={`p-6 rounded-lg border ${i === 0 ? 'border-green-500 bg-green-500/10' : 'border-orange-500 bg-orange-500/10'}`}>
            <h3 className={`font-bold text-xl mb-2 ${i === 0 ? 'text-green-400' : 'text-orange-400'}`}>{item.name}</h3>
            <p className="text-slate-300 mb-3">{item.description}</p>
            <ul className="space-y-1 mb-3">
              {item.characteristics?.map((c, j) => <li key={j} className="text-slate-400 text-sm">• {c}</li>)}
            </ul>
            <p className="text-slate-500 text-sm">Languages: {item.examples}</p>
          </div>
        ))}
      </div>
    )}
    {slide.content.approaches && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {slide.content.approaches.map((a, i) => (
          <div key={i} className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-cyan-400 font-bold mb-3">{a.name}</h3>
            <div className="mb-2">
              <p className="text-green-400 text-xs mb-1">✓ Pros</p>
              <ul className="text-slate-300 text-sm">{a.pros?.map((p, j) => <li key={j}>• {p}</li>)}</ul>
            </div>
            <div className="mb-2">
              <p className="text-red-400 text-xs mb-1">✗ Cons</p>
              <ul className="text-slate-400 text-sm">{a.cons?.map((c, j) => <li key={j}>• {c}</li>)}</ul>
            </div>
            {a.uses && <p className="text-slate-500 text-sm mt-2">Uses: {a.uses}</p>}
          </div>
        ))}
      </div>
    )}
    {slide.content.insight && (
      <div className="mt-6 p-4 bg-cyan-500/20 border border-cyan-500 rounded-lg text-center">
        <p className="text-cyan-400 font-bold">{slide.content.insight}</p>
      </div>
    )}
    {slide.interactive?.type === 'memory-layout' && <MemoryLayoutDemo />}
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
    {slide.content.languages && <p className="mt-4 text-slate-400">Languages: {slide.content.languages}</p>}
    {slide.content.note && <p className="mt-4 text-amber-400 italic">{slide.content.note}</p>}
    {slide.content.historical && (
      <div className="mt-4 p-3 bg-amber-500/20 rounded-lg">
        <p className="text-amber-400">{slide.content.historical}</p>
      </div>
    )}
    {slide.content.problems && (
      <div className="mt-4 space-y-2">
        <p className="text-slate-400 font-medium">Issues:</p>
        {slide.content.problems.map((p, i) => <p key={i} className="text-red-400 text-sm">• {p}</p>)}
      </div>
    )}
    {slide.content.distinction && (
      <div className="mt-6 space-y-3">
        {slide.content.distinction.map((d, i) => (
          <div key={i} className="bg-slate-800 p-3 rounded-lg">
            <span className="text-cyan-400 font-bold">{d.term}: </span>
            <span className="text-white">{d.definition}</span>
            {d.example && <span className="text-slate-400 font-mono text-sm ml-2">({d.example})</span>}
          </div>
        ))}
      </div>
    )}
    {slide.content.example && (
      <div className="mt-4 bg-slate-900 p-6 rounded-lg">
        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{slide.content.example.code}</pre>
        {slide.content.example.explanation && (
          <p className="text-slate-400 mt-2">{slide.content.example.explanation}</p>
        )}
      </div>
    )}
    {slide.interactive?.type === 'alias-demo' && <AliasDemo />}
    {slide.interactive?.type === 'closure-demo' && <ClosureDemo />}
  </div>
);

const ProblemSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="space-y-6">
      {slide.content.problems?.map((prob, i) => (
        <div key={i} className={`p-6 rounded-lg border-2 ${
          prob.color === 'yellow' ? 'border-yellow-500 bg-yellow-500/10' :
          prob.color === 'red' ? 'border-red-500 bg-red-500/10' :
          'border-slate-500 bg-slate-800/50'
        }`}>
          <h3 className={`font-bold text-xl mb-2 ${
            prob.color === 'yellow' ? 'text-yellow-400' :
            prob.color === 'red' ? 'text-red-400' : 'text-white'
          }`}>{prob.name}</h3>
          <p className="text-slate-300 mb-2"><strong>Condition:</strong> {prob.condition}</p>
          <p className="text-slate-400 mb-2">{prob.description}</p>
          <p className="text-slate-400 mb-2"><strong>Example:</strong> {prob.example}</p>
          <p className="text-green-400"><strong>Solution:</strong> {prob.solution}</p>
        </div>
      ))}
    </div>
    {slide.interactive?.type === 'lifetime-demo' && <LifetimeDemo />}
  </div>
);

const DiagramSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.content.description && <p className="text-slate-300 mb-8">{slide.content.description}</p>}
    {slide.content.components && (
      <div className="space-y-2">
        {slide.content.components.map((c, i) => (
          <div key={i} className="flex items-center gap-5 bg-slate-800/50 p-3 rounded-lg">
            <div className="w-32 text-cyan-400 font-bold">{c.name}</div>
            <div className="flex-1 text-white">{c.description}</div>
            <div className="text-slate-400 font-mono text-sm">{c.offset}</div>
          </div>
        ))}
      </div>
    )}
    {slide.content.approaches && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {slide.content.approaches.map((a, i) => (
          <div key={i} className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-cyan-400 font-bold mb-2">{a.name}</h3>
            <p className="text-slate-300 text-sm mb-2"><strong>How:</strong> {a.how}</p>
            <p className="text-slate-300 text-sm mb-2"><strong>Lookup:</strong> {a.lookup}</p>
            <p className="text-amber-400 text-sm">{a.tradeoff}</p>
          </div>
        ))}
      </div>
    )}
    {slide.content.note && <p className="mt-4 text-slate-400 italic">{slide.content.note}</p>}
    {slide.content.comparison && <p className="mt-4 text-cyan-400">{slide.content.comparison}</p>}
    {slide.interactive?.type === 'stack-frame' && <StackFrameDemo />}
  </div>
);

const WalkthroughSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.content.intro && <p className="text-slate-300 mb-8">{slide.content.intro}</p>}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left p-2 text-slate-400">Step</th>
            <th className="text-left p-2 text-blue-400">Static Scope</th>
            <th className="text-left p-2 text-purple-400">Dynamic Scope</th>
          </tr>
        </thead>
        <tbody>
          {slide.content.steps?.map((s, i) => (
            <tr key={i} className="border-b border-slate-800">
              <td className="p-2 text-white font-mono">{s.step}</td>
              <td className="p-2 text-slate-300">{s.static}</td>
              <td className="p-2 text-slate-300">{s.dynamic}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {slide.interactive?.type === 'scope-trace' && <ScopeDemo />}
  </div>
);

const InteractiveSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.content.code && (
      <div className="bg-slate-900 p-6 rounded-lg mb-4">
        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{slide.content.code}</pre>
      </div>
    )}
    {slide.content.question && (
      <p className="text-xl text-amber-400 mb-4">{slide.content.question}</p>
    )}
    {slide.interactive?.type === 'scope-demo' && <ScopeDemo />}
  </div>
);

const CodeSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="bg-slate-900 p-6 rounded-lg mb-8">
      <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{slide.content.code}</pre>
    </div>
    {slide.content.explanation && (
      <div className="space-y-2">
        {slide.content.explanation.map((ex, i) => (
          <div key={i} className="flex gap-5 bg-slate-800/50 p-3 rounded">
            <span className="text-cyan-400 font-mono min-w-48">{ex.label}</span>
            <span className="text-slate-300">{ex.meaning}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-cyan-400 font-bold text-2xl mb-4">{section.title}</h3>
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
    case 'definition': return <DefinitionSlide slide={slide} />;
    case 'timeline': return <TimelineSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'concept': return <ConceptSlide slide={slide} />;
    case 'problem': return <ProblemSlide slide={slide} />;
    case 'diagram': return <DiagramSlide slide={slide} />;
    case 'walkthrough': return <WalkthroughSlide slide={slide} />;
    case 'interactive': return <InteractiveSlide slide={slide} />;
    case 'code': return <CodeSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter3Slides({ onBackToChapters }) {
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
            <span className="text-cyan-400 font-bold">Ch 3: {CHAPTER_CONFIG.title}</span>
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
            <h3 className="text-xl font-bold mb-4">Chapter 3 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-cyan-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-cyan-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 rounded text-base disabled:opacity-30">
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

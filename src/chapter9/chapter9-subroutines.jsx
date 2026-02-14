import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 9: SUBROUTINES AND CONTROL ABSTRACTION
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 9,
  title: "Subroutines and Control Abstraction",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#f43f5e" // rose
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
    title: "Chapter 9: Subroutines and Control Abstraction",
    content: {
      subtitle: "Functions, Procedures, and Parameter Passing",
      topics: [
        "Stack Frames",
        "Calling Conventions",
        "Parameter Passing Modes",
        "L-values vs R-values",
        "Exception Handling",
        "Coroutines"
      ]
    }
  },

  // SUBROUTINES OVERVIEW
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Subroutines: The Big Picture",
    content: {
      description: "Subroutines are the fundamental unit of code reuse:",
      items: [
        { icon: "📦", text: "Abstraction", detail: "Hide implementation details behind an interface" },
        { icon: "🔄", text: "Reuse", detail: "Write once, call many times" },
        { icon: "📚", text: "Stack-based", detail: "Local state managed on runtime stack" },
        { icon: "🔗", text: "Calling Conventions", detail: "Agreement on how to pass data and control" }
      ]
    }
  },

  // MEMORY LAYOUT
  {
    id: 3,
    section: "stack",
    type: "concept",
    title: "Program Memory Layout",
    content: {
      description: "How memory is organized at runtime:",
      items: [
        { icon: "📜", text: "Code (Text)", detail: "Machine instructions (static, read-only)" },
        { icon: "🌍", text: "Static/Global", detail: "Global variables, constants" },
        { icon: "📚", text: "Stack", detail: "Local variables, parameters, return addresses" },
        { icon: "🗑️", text: "Heap", detail: "Dynamically allocated memory" }
      ]
    },
    interactive: { type: "memory-layout" }
  },

  // STACK FRAME
  {
    id: 4,
    section: "stack",
    type: "concept",
    title: "Stack Frame (Activation Record)",
    content: {
      description: "Contents of each function's stack frame:",
      items: [
        { icon: "↩️", text: "Return Address", detail: "Where to continue after function returns" },
        { icon: "🔗", text: "Dynamic Link", detail: "Pointer to caller's frame (previous frame pointer)" },
        { icon: "📍", text: "Static Link", detail: "For nested functions: pointer to enclosing scope" },
        { icon: "💾", text: "Saved Registers", detail: "Registers that must be preserved" },
        { icon: "📥", text: "Parameters", detail: "Arguments passed to function" },
        { icon: "📦", text: "Local Variables", detail: "Function's local data" },
        { icon: "📋", text: "Temporaries", detail: "Intermediate computation results" }
      ]
    },
    interactive: { type: "stack-frame" }
  },

  // CALLING SEQUENCE
  {
    id: 5,
    section: "stack",
    type: "concept",
    title: "Calling Sequence",
    content: {
      description: "Steps to call and return from a subroutine:",
      items: [
        { icon: "1️⃣", text: "Caller: Save registers", detail: "Save any caller-saves registers still needed" },
        { icon: "2️⃣", text: "Caller: Push arguments", detail: "Put arguments in registers or on stack" },
        { icon: "3️⃣", text: "Caller: Call instruction", detail: "Push return address, jump to callee" },
        { icon: "4️⃣", text: "Callee: Prologue", detail: "Set up frame pointer, allocate locals" },
        { icon: "5️⃣", text: "Callee: Execute body", detail: "Run the function code" },
        { icon: "6️⃣", text: "Callee: Epilogue", detail: "Clean up, restore registers, return" }
      ]
    },
    interactive: { type: "calling-sequence" }
  },

  // CALLER VS CALLEE SAVES
  {
    id: 6,
    section: "stack",
    type: "comparison",
    title: "Caller-Saves vs Callee-Saves",
    content: {
      approaches: [
        {
          name: "Caller-Saves",
          characteristics: [
            "Caller saves registers it needs preserved",
            "Caller knows which registers are in use",
            "Callee can freely use these registers",
            "More saves if callee doesn't use them"
          ]
        },
        {
          name: "Callee-Saves",
          characteristics: [
            "Callee saves registers it will modify",
            "Callee knows which registers it uses",
            "Caller's values automatically preserved",
            "More saves if caller doesn't need them"
          ]
        }
      ],
      note: "Most ABIs split registers: some caller-saves, some callee-saves"
    }
  },

  // LEAF ROUTINES
  {
    id: 7,
    section: "stack",
    type: "concept",
    title: "Leaf Routines",
    content: {
      description: "Functions that don't call other functions:",
      items: [
        { icon: "🍃", text: "Definition", detail: "A leaf routine makes no subroutine calls" },
        { icon: "⚡", text: "Optimization", detail: "Can skip much of prologue/epilogue" },
        { icon: "📚", text: "No Stack Frame", detail: "May not need to allocate stack space at all" },
        { icon: "🚀", text: "Very Fast", detail: "Simple leaf routines run entirely in registers" }
      ],
      code: `// Leaf routine - no calls
int square(int x) {
    return x * x;  // Just uses registers
}`
    }
  },

  // L-VALUE VS R-VALUE
  {
    id: 8,
    section: "values",
    type: "concept",
    title: "L-values vs R-values",
    content: {
      description: "Two kinds of values in expressions:",
      items: [
        { icon: "📍", text: "L-value", detail: "Has a persistent memory location (can appear on LEFT of =)" },
        { icon: "📊", text: "R-value", detail: "Temporary value, no persistent address (only RIGHT of =)" }
      ],
      code: `int x = 5;      // x is l-value, 5 is r-value
x = x + 3;      // x (left) is l-value, x+3 is r-value
int *p = &x;    // &x gets ADDRESS of l-value
// &(x+3) ERROR - can't get address of r-value`
    },
    interactive: { type: "lvalue-rvalue" }
  },

  // PARAMETER PASSING OVERVIEW
  {
    id: 9,
    section: "params",
    type: "concept",
    title: "Parameter Passing Modes",
    content: {
      description: "How arguments are passed to functions:",
      items: [
        { icon: "📋", text: "By Value", detail: "Copy the value - callee gets independent copy" },
        { icon: "👆", text: "By Reference", detail: "Pass address - callee can modify original" },
        { icon: "📤", text: "By Value/Result", detail: "Copy in, copy back out on return" },
        { icon: "📝", text: "By Name", detail: "Textual substitution (like macros)" }
      ]
    }
  },

  // PASS BY VALUE
  {
    id: 10,
    section: "params",
    type: "concept",
    title: "Pass by Value",
    content: {
      description: "Callee receives a copy of the argument:",
      items: [
        { icon: "📋", text: "How it works", detail: "Value is copied into parameter variable" },
        { icon: "🛡️", text: "Safety", detail: "Original cannot be modified accidentally" },
        { icon: "📦", text: "Cost", detail: "Copying large objects can be expensive" }
      ],
      code: `void increment(int x) {
    x = x + 1;  // Modifies local copy only
}

int a = 5;
increment(a);
// a is still 5!`
    },
    interactive: { type: "pass-by-value" }
  },

  // PASS BY REFERENCE
  {
    id: 11,
    section: "params",
    type: "concept",
    title: "Pass by Reference",
    content: {
      description: "Callee receives the address of the argument:",
      items: [
        { icon: "👆", text: "How it works", detail: "Address passed; callee accesses original" },
        { icon: "✏️", text: "Modification", detail: "Changes affect the original variable" },
        { icon: "⚡", text: "Efficiency", detail: "No copying - just pass a pointer" },
        { icon: "⚠️", text: "Aliasing", detail: "Same memory accessible by different names" }
      ],
      code: `void increment(int &x) {  // C++ reference
    x = x + 1;  // Modifies original!
}

int a = 5;
increment(a);
// a is now 6!`
    },
    interactive: { type: "pass-by-reference" }
  },

  // PASS BY VALUE/RESULT
  {
    id: 12,
    section: "params",
    type: "concept",
    title: "Pass by Value/Result (Copy-In/Copy-Out)",
    content: {
      description: "Copy in at call, copy back at return:",
      items: [
        { icon: "📥", text: "Copy In", detail: "Value copied to parameter at call" },
        { icon: "📤", text: "Copy Out", detail: "Parameter copied back to argument at return" },
        { icon: "🔀", text: "Difference from Reference", detail: "No aliasing during execution" }
      ],
      code: `// Ada style
procedure swap(x: in out Integer; y: in out Integer) is
    temp: Integer := x;
begin
    x := y;
    y := temp;
end swap;`
    }
  },

  // PASS BY NAME
  {
    id: 13,
    section: "params",
    type: "concept",
    title: "Pass by Name (Thunks)",
    content: {
      description: "Textual substitution - argument re-evaluated each use:",
      items: [
        { icon: "📝", text: "How it works", detail: "Like macro expansion - text substituted" },
        { icon: "🔄", text: "Re-evaluation", detail: "Argument expression evaluated each time used" },
        { icon: "😴", text: "Lazy", detail: "Never evaluated if parameter never used" },
        { icon: "⚙️", text: "Thunks", detail: "Implemented as hidden procedures" }
      ],
      code: `// Algol 60 style
// If you pass a[i] by name, and the function
// modifies i, subsequent uses of the parameter
// access different array elements!`
    }
  },

  // PARAMETER COMPARISON
  {
    id: 14,
    section: "params",
    type: "table",
    title: "Parameter Passing Comparison",
    content: {
      headers: ["Mode", "Copy?", "Can Modify Original?", "Aliasing?"],
      rows: [
        ["Value", "Yes (in)", "No", "No"],
        ["Reference", "No", "Yes", "Yes"],
        ["Value/Result", "Yes (in & out)", "Yes (at return)", "No"],
        ["Name", "No (re-eval)", "Depends", "Complex"]
      ]
    },
    interactive: { type: "param-comparison" }
  },

  // MACROS VS FUNCTIONS
  {
    id: 15,
    section: "params",
    type: "comparison",
    title: "Macros vs Functions",
    content: {
      approaches: [
        {
          name: "Macros",
          code: "#define MIN(a,b) ((a)<(b)?(a):(b))",
          characteristics: [
            "Textual substitution",
            "No function call overhead",
            "Arguments evaluated multiple times",
            "No type checking"
          ]
        },
        {
          name: "Functions",
          code: "int min(int a, int b) { return a<b?a:b; }",
          characteristics: [
            "Actual subroutine call",
            "Arguments evaluated once",
            "Type checking",
            "Smaller code size"
          ]
        }
      ],
      note: "Inline functions: best of both worlds (compiler hint)"
    }
  },

  // LAZY VS EAGER
  {
    id: 16,
    section: "evaluation",
    type: "comparison",
    title: "Lazy vs Eager Evaluation",
    content: {
      approaches: [
        {
          name: "Eager (Strict)",
          characteristics: [
            "Arguments evaluated BEFORE call",
            "Most languages use this",
            "Predictable evaluation order",
            "May evaluate unused arguments"
          ],
          examples: "C, Java, Python, most languages"
        },
        {
          name: "Lazy (Non-strict)",
          characteristics: [
            "Arguments evaluated WHEN NEEDED",
            "Can handle infinite data structures",
            "More efficient if arg unused",
            "Harder to reason about"
          ],
          examples: "Haskell, call-by-name/need"
        }
      ]
    },
    interactive: { type: "lazy-eager" }
  },

  // EXCEPTION HANDLING
  {
    id: 17,
    section: "exceptions",
    type: "concept",
    title: "Exception Handling",
    content: {
      description: "Dealing with runtime errors and unusual conditions:",
      items: [
        { icon: "⚠️", text: "Exception", detail: "Runtime error or unusual condition" },
        { icon: "🎯", text: "Handler", detail: "Code that runs when exception occurs" },
        { icon: "🔼", text: "Propagation", detail: "Exceptions bubble up call stack" },
        { icon: "🧹", text: "Cleanup", detail: "Finally blocks, RAII for resource cleanup" }
      ],
      code: `try {
    riskyOperation();
} catch (IOException e) {
    handleError(e);
} finally {
    cleanup();  // Always runs
}`
    }
  },

  // EXCEPTION IMPLEMENTATION
  {
    id: 18,
    section: "exceptions",
    type: "concept",
    title: "Exception Implementation",
    content: {
      description: "How exceptions work under the hood:",
      items: [
        { icon: "📚", text: "Stack Unwinding", detail: "Pop frames until handler found" },
        { icon: "📋", text: "Handler Tables", detail: "Map PC ranges to handlers" },
        { icon: "⚡", text: "Zero-cost when not thrown", detail: "Modern approach: no overhead if no exception" },
        { icon: "💰", text: "Expensive when thrown", detail: "Stack unwinding is costly" }
      ]
    }
  },

  // COROUTINES
  {
    id: 19,
    section: "coroutines",
    type: "concept",
    title: "Coroutines",
    content: {
      description: "Subroutines that can suspend and resume:",
      items: [
        { icon: "⏸️", text: "Suspend", detail: "Pause execution, save state" },
        { icon: "▶️", text: "Resume", detail: "Continue from where we left off" },
        { icon: "🔄", text: "Symmetric", detail: "Any coroutine can transfer to any other" },
        { icon: "📦", text: "Generators", detail: "Asymmetric: yield values to caller" }
      ],
      code: `// Python generator (asymmetric coroutine)
def count_up():
    n = 0
    while True:
        yield n  # Suspend, return n
        n += 1   # Resume here next time`
    },
    interactive: { type: "coroutines" }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 9 Summary",
    content: {
      sections: [
        {
          title: "Stack & Calling",
          points: [
            "Stack frames hold locals, params, return addr",
            "Calling conventions coordinate caller/callee",
            "Leaf routines can be highly optimized"
          ]
        },
        {
          title: "Parameter Passing",
          points: [
            "By value: copy, safe, can't modify original",
            "By reference: address, can modify, aliasing",
            "By name: lazy, textual substitution"
          ]
        },
        {
          title: "Control Flow",
          points: [
            "Exceptions: non-local control transfer",
            "Coroutines: suspendable subroutines",
            "Lazy evaluation: compute only when needed"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Memory Layout Demo
const MemoryLayoutDemo = () => {
  const [highlight, setHighlight] = useState(null);

  const regions = [
    { name: 'Stack', desc: 'Grows down ↓ Local vars, params, return addresses', color: 'rose', top: true },
    { name: '↓ Free ↑', desc: 'Unused space between stack and heap', color: 'gray', middle: true },
    { name: 'Heap', desc: 'Grows up ↑ Dynamic allocation (malloc, new)', color: 'amber' },
    { name: 'BSS', desc: 'Uninitialized global/static variables', color: 'green' },
    { name: 'Data', desc: 'Initialized global/static variables', color: 'blue' },
    { name: 'Text', desc: 'Program code (read-only)', color: 'purple' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Program Memory Layout</div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          {regions.map((r, i) => (
            <button
              key={i}
              onClick={() => setHighlight(r.name)}
              className={`w-full p-3 rounded text-left transition-all ${
                r.color === 'rose' ? 'bg-rose-500/30 hover:bg-rose-500/50' :
                r.color === 'gray' ? 'bg-slate-700/50' :
                r.color === 'amber' ? 'bg-amber-500/30 hover:bg-amber-500/50' :
                r.color === 'green' ? 'bg-green-500/30 hover:bg-green-500/50' :
                r.color === 'blue' ? 'bg-blue-500/30 hover:bg-blue-500/50' :
                'bg-purple-500/30 hover:bg-purple-500/50'
              } ${highlight === r.name ? 'ring-2 ring-white' : ''}`}
              style={{ height: r.middle ? '60px' : '50px' }}
            >
              <span className="font-mono text-lg text-white">{r.name}</span>
            </button>
          ))}
          <div className="text-center text-slate-400 text-sm mt-2">High Address ↑ | Low Address ↓</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg">
          {highlight ? (
            <div>
              <div className="text-rose-400 font-bold text-xl mb-2">{highlight}</div>
              <div className="text-slate-300 text-lg">
                {regions.find(r => r.name === highlight)?.desc}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-lg">Click a memory region to see details</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stack Frame Demo
const StackFrameDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'main() calls foo(5, 10)', frames: ['main'] },
    { desc: 'foo() stack frame created', frames: ['main', 'foo(5,10)'] },
    { desc: 'foo() calls bar(x)', frames: ['main', 'foo(5,10)', 'bar(5)'] },
    { desc: 'bar() returns to foo()', frames: ['main', 'foo(5,10)'] },
    { desc: 'foo() returns to main()', frames: ['main'] }
  ];

  const frameContents = {
    'main': ['return addr', 'saved regs', 'local vars'],
    'foo(5,10)': ['return addr → main', 'saved FP', 'param: a=5', 'param: b=10', 'local: x'],
    'bar(5)': ['return addr → foo', 'saved FP', 'param: n=5', 'local: result']
  };

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Stack Frames</div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-slate-400 text-base mb-2">Call Stack (grows down ↓)</div>
          <div className="space-y-2">
            {current.frames.slice().reverse().map((frame, i) => (
              <div key={i} className={`p-4 rounded-lg ${
                i === 0 ? 'bg-rose-500/30 border-2 border-rose-500' : 'bg-slate-700'
              }`}>
                <div className="font-mono text-xl text-white mb-2">{frame}</div>
                <div className="space-y-1">
                  {frameContents[frame]?.map((item, j) => (
                    <div key={j} className="text-slate-400 text-sm font-mono">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-rose-400 font-bold text-xl mb-2">Step {step + 1}</div>
          <div className="text-white text-xl">{current.desc}</div>
          <div className="mt-4 text-slate-400">
            Stack depth: {current.frames.length} frame(s)
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// L-value vs R-value Demo
const LvalueRvalueDemo = () => {
  const examples = [
    { expr: 'x', lvalue: true, rvalue: true, reason: 'Variable: has address, can be read' },
    { expr: 'x + 3', lvalue: false, rvalue: true, reason: 'Expression result: no persistent location' },
    { expr: '*p', lvalue: true, rvalue: true, reason: 'Dereference: refers to memory location' },
    { expr: '&x', lvalue: false, rvalue: true, reason: 'Address: computed value, not a location' },
    { expr: 'a[i]', lvalue: true, rvalue: true, reason: 'Array element: has address' },
    { expr: '42', lvalue: false, rvalue: true, reason: 'Literal: no address, just a value' }
  ];

  const [selected, setSelected] = useState(0);
  const current = examples[selected];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: L-values vs R-values</div>
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-4 py-2 rounded-lg font-mono text-lg ${
              selected === i ? 'bg-rose-500 text-white' : 'bg-slate-700'
            }`}
          >
            {ex.expr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${current.lvalue ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
          <div className={`text-2xl font-bold ${current.lvalue ? 'text-green-400' : 'text-red-400'}`}>
            {current.lvalue ? '✓' : '✗'} L-value
          </div>
          <div className="text-slate-300 text-lg mt-2">
            {current.lvalue ? 'Can appear on LEFT of =' : 'Cannot be assigned to'}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${current.rvalue ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
          <div className={`text-2xl font-bold ${current.rvalue ? 'text-green-400' : 'text-red-400'}`}>
            {current.rvalue ? '✓' : '✗'} R-value
          </div>
          <div className="text-slate-300 text-lg mt-2">
            {current.rvalue ? 'Can appear on RIGHT of =' : 'Cannot be read'}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <span className="text-rose-400 font-mono text-2xl">{current.expr}</span>
        <span className="text-slate-400 text-lg ml-4">— {current.reason}</span>
      </div>
    </div>
  );
};

// Pass by Value Demo
const PassByValueDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'Call increment(a) where a = 5', a: 5, x: null, phase: 'before' },
    { desc: 'x receives COPY of a (x = 5)', a: 5, x: 5, phase: 'copy' },
    { desc: 'x = x + 1 (x becomes 6)', a: 5, x: 6, phase: 'modify' },
    { desc: 'Function returns. a unchanged!', a: 5, x: null, phase: 'after' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Pass by Value</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg">
        <span className="text-rose-400">void</span> increment(<span className="text-blue-400">int</span> x) {'{'} x = x + 1; {'}'}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Caller's variable</div>
          <div className="text-4xl font-mono font-bold text-blue-400">a = {current.a}</div>
        </div>
        <div className={`p-4 rounded-lg ${current.x !== null ? 'bg-rose-500/20' : 'bg-slate-900'}`}>
          <div className="text-slate-400 text-base">Parameter (copy)</div>
          <div className="text-4xl font-mono font-bold text-rose-400">
            x = {current.x !== null ? current.x : '—'}
          </div>
        </div>
      </div>

      <div className="bg-rose-500/20 p-4 rounded-lg mb-4">
        <div className="text-rose-400 text-xl">{current.desc}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Pass by Reference Demo
const PassByReferenceDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'Call increment(a) where a = 5', a: 5, phase: 'before' },
    { desc: 'x is ALIAS for a (same memory!)', a: 5, phase: 'alias', arrow: true },
    { desc: 'x = x + 1 modifies a!', a: 6, phase: 'modify', arrow: true },
    { desc: 'Function returns. a is now 6!', a: 6, phase: 'after' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Pass by Reference</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg">
        <span className="text-rose-400">void</span> increment(<span className="text-blue-400">int</span> <span className="text-green-400">&</span>x) {'{'} x = x + 1; {'}'}
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Variable a</div>
          <div className={`text-4xl font-mono font-bold ${current.a === 6 ? 'text-green-400' : 'text-blue-400'}`}>
            {current.a}
          </div>
        </div>
        
        {current.arrow && (
          <>
            <div className="text-rose-400 text-3xl">←</div>
            <div className="bg-rose-500/20 p-4 rounded-lg text-center">
              <div className="text-slate-400 text-base">x (alias)</div>
              <div className="text-rose-400 text-lg font-mono">points to a</div>
            </div>
          </>
        )}
      </div>

      <div className="bg-green-500/20 p-4 rounded-lg mb-4">
        <div className="text-green-400 text-xl">{current.desc}</div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// Coroutines Demo
const CoroutinesDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { gen: 0, caller: 'next()', genState: 'running', value: null },
    { gen: 1, caller: 'receives 0', genState: 'suspended', value: 0 },
    { gen: 1, caller: 'next()', genState: 'running', value: null },
    { gen: 2, caller: 'receives 1', genState: 'suspended', value: 1 },
    { gen: 2, caller: 'next()', genState: 'running', value: null },
    { gen: 3, caller: 'receives 2', genState: 'suspended', value: 2 }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Generator (Coroutine)</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-base">
        <span className="text-rose-400">def</span> count():<br/>
        <span className="ml-4">n = 0</span><br/>
        <span className="ml-4 text-rose-400">while</span> True:<br/>
        <span className="ml-8 text-green-400">yield</span> n  <span className="text-slate-500"># suspend, return n</span><br/>
        <span className="ml-8">n += 1</span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className={`p-4 rounded-lg ${current.genState === 'running' ? 'bg-green-500/20 border border-green-500' : 'bg-amber-500/20 border border-amber-500'}`}>
          <div className="text-slate-400 text-base">Generator</div>
          <div className="text-2xl font-bold text-white">n = {current.gen}</div>
          <div className={`text-lg ${current.genState === 'running' ? 'text-green-400' : 'text-amber-400'}`}>
            {current.genState === 'running' ? '▶ Running' : '⏸ Suspended'}
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Caller</div>
          <div className="text-xl text-white">{current.caller}</div>
          {current.value !== null && (
            <div className="text-2xl font-bold text-rose-400 mt-2">→ {current.value}</div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">📞</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-rose-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-6 text-rose-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'memory-layout' && <MemoryLayoutDemo />}
    {slide.interactive?.type === 'stack-frame' && <StackFrameDemo />}
    {slide.interactive?.type === 'calling-sequence' && <StackFrameDemo />}
    {slide.interactive?.type === 'lvalue-rvalue' && <LvalueRvalueDemo />}
    {slide.interactive?.type === 'pass-by-value' && <PassByValueDemo />}
    {slide.interactive?.type === 'pass-by-reference' && <PassByReferenceDemo />}
    {slide.interactive?.type === 'coroutines' && <CoroutinesDemo />}
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
                <li key={j} className="text-slate-300 text-lg">• {c}</li>
              ))}
            </ul>
          )}
          {a.examples && <p className="text-slate-500 text-base mt-3">Examples: {a.examples}</p>}
        </div>
      ))}
    </div>
    {slide.content.note && <p className="mt-6 text-rose-400 text-xl italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'lazy-eager' && <PassByValueDemo />}
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
              <th key={i} className="text-left p-4 text-rose-400 font-bold text-xl">{h}</th>
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
    {slide.interactive?.type === 'param-comparison' && <PassByValueDemo />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-rose-400 font-bold text-2xl mb-5">{section.title}</h3>
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
export default function Chapter9Slides({ onBackToChapters }) {
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
            <span className="text-rose-400 font-bold text-lg">Ch 9: Subroutines</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 9 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-rose-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-rose-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-30">
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

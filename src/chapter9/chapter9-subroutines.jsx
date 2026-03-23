import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 9: SUBROUTINES AND CONTROL ABSTRACTION
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides  —  OPTIMIZED VERSION
// ============================================================================

const CHAPTER_CONFIG = {
  number: 9,
  title: "Subroutines and Control Abstraction",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#f43f5e"
};

// ============================================================================
// SLIDE DATA
// ============================================================================
const SLIDES = [
  // SLIDE 1 — TITLE
  {
    id: 1,
    section: "intro",
    type: "title",
    title: "Chapter 9: Subroutines and Control Abstraction",
    content: {
      subtitle: "Functions, Procedures, and Parameter Passing",
      topics: ["Stack Frames", "Calling Conventions", "Parameter Passing Modes",
               "L-values vs R-values", "Exception Handling", "Coroutines"]
    }
  },

  // SLIDE 2 — SUBROUTINES OVERVIEW
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Subroutines: The Big Picture",
    content: {
      description: "Subroutines are the fundamental unit of code reuse:",
      explanation: "A subroutine (also called a function, procedure, or method) lets you name a block of code, call it from many places, and pass data in and out. Without subroutines, every program would be a single giant sequence of instructions with no logical structure. The key insight is that each call gets its own private workspace on the stack, so the same function can be called recursively or from multiple places without its local variables interfering with each other.",
      items: [
        { icon: "📦", text: "Abstraction", detail: "Hide implementation details behind an interface" },
        { icon: "🔄", text: "Reuse", detail: "Write once, call many times from different contexts" },
        { icon: "📚", text: "Stack-based", detail: "Each call gets its own frame with fresh local variables" },
        { icon: "🔗", text: "Calling Conventions", detail: "Agreed protocol: who saves registers, how args are passed" }
      ]
    }
  },

  // SLIDE 3 — MEMORY LAYOUT
  {
    id: 3,
    section: "stack",
    type: "concept",
    title: "Program Memory Layout",
    content: {
      description: "How a process's address space is organized at runtime:",
      explanation: "Every running program has its memory divided into distinct segments. The Text segment holds your compiled code (read-only). Global variables live in Data/BSS. The Heap grows upward as you allocate objects dynamically. The Stack grows downward as you call functions. The stack and heap grow toward each other — if they collide, you get a stack overflow or out-of-memory error. Understanding this layout is essential for understanding where local variables, global variables, and heap objects actually live.",
      items: [
        { icon: "📜", text: "Code (Text)", detail: "Machine instructions — static, read-only, shared between processes" },
        { icon: "🌍", text: "Static / Global", detail: "Global variables (Data = initialized, BSS = zero-initialized)" },
        { icon: "📚", text: "Stack", detail: "Local variables, parameters, return addresses — grows DOWN ↓" },
        { icon: "🗑️", text: "Heap", detail: "Dynamically allocated memory (malloc/new) — grows UP ↑" }
      ]
    },
    interactive: { type: "memory-layout" }
  },

  // SLIDE 4 — STACK FRAME
  {
    id: 4,
    section: "stack",
    type: "concept",
    title: "Stack Frame (Activation Record)",
    content: {
      description: "Every function call pushes an activation record onto the stack:",
      explanation: "When a function is called, the CPU allocates a 'stack frame' (also called an activation record) that holds everything the function needs to run and then return cleanly. The frame pointer (FP/RBP) points to the base of the current frame, making it easy to find parameters and locals at fixed offsets. When the function returns, its frame is popped and the caller's frame is restored — the caller picks up exactly where it left off.",
      items: [
        { icon: "↩️", text: "Return Address", detail: "Address in caller where execution resumes after return" },
        { icon: "🔗", text: "Dynamic Link", detail: "Saved caller frame pointer — restores FP on return" },
        { icon: "📍", text: "Static Link", detail: "For nested functions: pointer to enclosing scope's frame" },
        { icon: "💾", text: "Saved Registers", detail: "Callee-save registers this function will use" },
        { icon: "📥", text: "Parameters", detail: "Arguments passed by the caller (first 6 in registers on x86-64)" },
        { icon: "📦", text: "Local Variables & Temporaries", detail: "Function's own data — private to this call" }
      ]
    },
    interactive: { type: "stack-frame" }
  },

  // SLIDE 5 — CALLING SEQUENCE  ★ NEW INTERACTIVE DEMO
  {
    id: 5,
    section: "stack",
    type: "concept",
    title: "Calling Sequence",
    content: {
      description: "The precise choreography of a function call — six steps between caller and callee:",
      explanation: "A function call is not a single operation — it is a carefully choreographed protocol split between the caller and the callee. Both sides must follow the same rules (the ABI) or the program silently corrupts data. The interactive demo below shows each step as actual x86-64 assembly instructions, so you can see exactly what the CPU executes before your function body runs a single line.",
      items: [
        { icon: "1️⃣", text: "Caller: Save caller-save registers", detail: "Any values in RAX/RCX/RDX/RSI/RDI/R8-R11 the caller needs after the call must be saved to the caller's own frame first." },
        { icon: "2️⃣", text: "Caller: Place arguments", detail: "First 6 integer args → RDI, RSI, RDX, RCX, R8, R9. Remaining args pushed right-to-left onto the stack." },
        { icon: "3️⃣", text: "Caller: Execute CALL", detail: "CPU atomically pushes the return address (next instruction's PC) onto the stack, then jumps to the callee's first instruction." },
        { icon: "4️⃣", text: "Callee: Prologue", detail: "PUSH RBP — save caller's frame pointer. MOV RBP, RSP — set new frame base. SUB RSP, N — allocate space for locals." },
        { icon: "5️⃣", text: "Callee: Execute body", detail: "Run the function logic. Locals are at negative offsets from RBP; parameters at positive offsets." },
        { icon: "6️⃣", text: "Callee: Epilogue & RET", detail: "Place return value in RAX. Restore callee-save registers. LEAVE (restores RSP and RBP). RET pops return address and jumps to it." }
      ]
    },
    interactive: { type: "calling-sequence" }
  },

  // SLIDE 6 — CALLER VS CALLEE SAVES
  {
    id: 6,
    section: "stack",
    type: "comparison",
    title: "Caller-Saves vs Callee-Saves",
    content: {
      explanation: "The CPU has a fixed set of registers. When a function calls another, someone must save and restore the registers being used — otherwise the callee will overwrite the caller's values. The ABI splits registers into two groups to minimize unnecessary save/restore operations: caller-save registers are the callee's to destroy freely (the caller saves them if it cares), while callee-save registers must be preserved by any function that uses them.",
      approaches: [
        {
          name: "Caller-Saves (Volatile)",
          characteristics: [
            "Caller saves these before the call if it still needs them",
            "Callee can freely overwrite them — no obligation to restore",
            "Efficient when the callee actually uses them (no wasted save)",
            "x86-64: RAX, RCX, RDX, RSI, RDI, R8–R11, XMM0–XMM15"
          ]
        },
        {
          name: "Callee-Saves (Non-Volatile)",
          characteristics: [
            "Callee saves these at entry if it will modify them",
            "Caller's values are automatically intact after the call returns",
            "Efficient when the callee doesn't need them (they're untouched)",
            "x86-64: RBX, RBP, R12–R15"
          ]
        }
      ],
      note: "Most ABIs split registers: argument/return registers are caller-save; long-lived loop variables use callee-save registers."
    }
  },

  // SLIDE 7 — LEAF ROUTINES
  {
    id: 7,
    section: "stack",
    type: "concept",
    title: "Leaf Routines",
    content: {
      description: "Functions that call no other functions — prime optimization targets:",
      explanation: "A leaf routine sits at the leaves of the call graph — it makes no outgoing calls. This lets the compiler skip most of the calling-sequence overhead. Because no callee will ever clobber registers, a leaf function may not need to save/restore any registers. In many cases, it doesn't need to build a frame at all — locals can live entirely in registers, and the return address stays wherever the CALL instruction placed it. This makes tight inner loops dramatically faster.",
      items: [
        { icon: "🍃", text: "Definition", detail: "A leaf routine makes no subroutine calls whatsoever" },
        { icon: "⚡", text: "Skip prologue/epilogue", detail: "No need for PUSH RBP / MOV RBP,RSP / SUB RSP,N" },
        { icon: "📚", text: "May eliminate the frame entirely", detail: "Locals live in registers; RSP used directly as frame reference" },
        { icon: "🚀", text: "Runs entirely in registers", detail: "For simple math: just the body instructions + RET, nothing more" }
      ],
      code: `// Leaf routine — the compiler emits ~3 instructions total:
int square(int x) {
    return x * x;
}
// x86-64 output (gcc -O2):
//   IMUL  edi, edi    ; edi = x * x  (x arrived in RDI)
//   MOV   eax, edi    ; return value goes in EAX
//   RET               ; done — no frame setup at all`
    }
  },

  // SLIDE 8 — L-VALUE VS R-VALUE
  {
    id: 8,
    section: "values",
    type: "concept",
    title: "L-values vs R-values",
    content: {
      description: "Two fundamentally different kinds of expressions:",
      explanation: "Every expression in a program either denotes a memory location (an l-value) or a temporary computed value (an r-value). The names come from assignment: l-values can appear on the Left side, r-values can only appear on the Right side. This distinction is critical for understanding pass-by-reference: you can only pass an l-value by reference, because passing by reference means passing the address — and only l-values have a stable address to take.",
      items: [
        { icon: "📍", text: "L-value (Locator value)", detail: "Has a persistent memory location. Can be assigned to. You can take its address with &. Examples: x, *p, a[i]" },
        { icon: "📊", text: "R-value (Read value)", detail: "A temporary computed value — no persistent address. Cannot be assigned to. Examples: x+3, 42, &x (the address itself is a value)" }
      ],
      code: `int x = 5;       // x is l-value; 5 is r-value
x = x + 3;       // x (left) is l-value; x+3 is r-value
int *p = &x;     // &x gets address of l-value x  ✓
*p = 10;         // *p is l-value (dereferenced pointer)  ✓

// These are compile errors:
&(x + 3);        // ERROR — x+3 has no address
42 = x;          // ERROR — 42 is not assignable`
    },
    interactive: { type: "lvalue-rvalue" }
  },

  // SLIDE 9 — PARAMETER PASSING OVERVIEW
  {
    id: 9,
    section: "params",
    type: "concept",
    title: "Parameter Passing Modes",
    content: {
      description: "Four distinct answers to: how does a function receive its arguments?",
      explanation: "Parameter passing is one of the most consequential language design decisions. Each mode answers the question differently, trading off safety, efficiency, and flexibility. By Value is safest but copies data. By Reference is fast but creates aliases. By Value/Result copies both ways, avoiding aliases. By Name re-evaluates the argument on every use — the basis of lazy evaluation. Most languages choose one or two modes; Ada supports all four explicitly.",
      items: [
        { icon: "📋", text: "By Value", detail: "Argument value is copied into parameter. Original is safe. Default in C, Java primitives, Python." },
        { icon: "👆", text: "By Reference", detail: "Argument's address is passed. Callee modifies original directly. C++ &, Fortran." },
        { icon: "📤", text: "By Value/Result", detail: "Copy in at call; copy back out on return. No aliasing during execution. Ada in out." },
        { icon: "📝", text: "By Name", detail: "Argument expression textually substituted and re-evaluated every use. Algol 60, basis of Haskell laziness." }
      ]
    }
  },

  // SLIDE 10 — PASS BY VALUE
  {
    id: 10,
    section: "params",
    type: "concept",
    title: "Pass by Value",
    content: {
      description: "The callee receives a completely independent copy of the argument:",
      explanation: "Pass by value is the safest parameter mode: no matter what the callee does to its parameter, the caller's original variable is untouched. The cost is the copy itself — trivial for primitives like int, but potentially expensive for large structs. In C++, passing a large object by value triggers the copy constructor. The interactive demo below makes the copy-and-isolation behavior visual.",
      items: [
        { icon: "📋", text: "Mechanism", detail: "Argument expression is evaluated in the caller's scope and its value is placed in the callee's parameter variable (on the stack frame)" },
        { icon: "🛡️", text: "Safety", detail: "Caller's variable is completely protected — callee cannot affect it" },
        { icon: "📦", text: "Cost for large objects", detail: "Copying a big struct byte-by-byte is expensive. Use const T& in C++ for read-only large args." }
      ],
      code: `void increment(int x) {
    x = x + 1;   // modifies LOCAL COPY only
}

int a = 5;
increment(a);
// a is still 5 — the copy was modified, not a`
    },
    interactive: { type: "pass-by-value" }
  },

  // SLIDE 11 — PASS BY REFERENCE
  {
    id: 11,
    section: "params",
    type: "concept",
    title: "Pass by Reference",
    content: {
      description: "The callee receives the address of the argument — a direct alias:",
      explanation: "Pass by reference gives the callee a window directly into the caller's variable. Any write through the parameter immediately modifies the original. This is both the primary use case (returning multiple values, mutating a large object in place) and the primary danger (aliasing: two parameters pointing to the same memory can silently break algorithms). The interactive demo shows the alias in action.",
      items: [
        { icon: "👆", text: "Mechanism", detail: "The address of the argument l-value is passed. The parameter is an alias — another name for the same memory location." },
        { icon: "✏️", text: "Modification", detail: "Writes through the parameter immediately change the original. Used to return multiple output values." },
        { icon: "⚡", text: "Efficiency", detail: "Passing a pointer (8 bytes) is faster than copying a 1KB struct. Standard for large in/out parameters in C++." },
        { icon: "⚠️", text: "Aliasing danger", detail: "If two ref params point to the same variable, algorithms that assume independence break silently. swap(a,a) is the classic example." }
      ],
      code: `void increment(int& x) {  // C++ reference parameter
    x = x + 1;  // modifies the ORIGINAL variable!
}

int a = 5;
increment(a);
// a is now 6

// Aliasing hazard:
void add(int& x, int& y) { x = x + y; }
add(a, a);   // x and y BOTH alias a — x = a+a = 10`
    },
    interactive: { type: "pass-by-reference" }
  },

  // SLIDE 12 — PASS BY VALUE/RESULT
  {
    id: 12,
    section: "params",
    type: "concept",
    title: "Pass by Value/Result (Copy-In / Copy-Out)",
    content: {
      description: "Value is copied in at call, then copied back to the argument on return:",
      explanation: "Value/Result (also called copy-in/copy-out) looks like pass-by-reference from the outside — the caller's variable is updated — but it avoids aliasing during execution because the callee works on a fully independent copy. The update only happens at the moment of return. This matters when two parameters alias the same variable: under reference they interfere continuously; under value/result the final copy-out resolves cleanly.",
      items: [
        { icon: "📥", text: "Copy In (at call)", detail: "Argument value is copied to the parameter — callee gets an independent local copy" },
        { icon: "📤", text: "Copy Out (at return)", detail: "Final value of the parameter is written back to the argument location when the function returns" },
        { icon: "🔀", text: "Key difference from Reference", detail: "No aliasing during execution. swap(a,a) gives a well-defined result: value/result reads a, swaps the local copies, then writes back." }
      ],
      code: `-- Ada: 'in out' uses value/result semantics
procedure swap(x : in out Integer; y : in out Integer) is
   temp : Integer := x;   -- works on COPIES of a and b
begin
   x := y;
   y := temp;
end swap;
-- On return, copies are written back to caller's variables`
    }
  },

  // SLIDE 13 — PASS BY NAME
  {
    id: 13,
    section: "params",
    type: "concept",
    title: "Pass by Name (Thunks)",
    content: {
      description: "The argument expression is re-evaluated every time the parameter is used:",
      explanation: "Pass by name is the most exotic mode — and the oldest (Algol 60). Conceptually, wherever the parameter name appears in the callee's body, the argument expression is textually substituted and evaluated fresh in the caller's environment. Practically, this is implemented by wrapping the argument in a zero-argument function (a 'thunk') and calling it on every use. If the argument is never used, it is never evaluated — this is the essence of lazy evaluation.",
      items: [
        { icon: "📝", text: "Mechanism — Textual Substitution", detail: "Each use of the parameter re-evaluates the original expression in the caller's scope. Like a macro but scoped correctly." },
        { icon: "🔄", text: "Re-evaluation on every use", detail: "If i changes between two uses of parameter x (where x = a[i]), both uses may access different array elements!" },
        { icon: "😴", text: "Never evaluated if unused", detail: "If a parameter is never referenced inside the callee, its expression is never evaluated — not even once." },
        { icon: "⚙️", text: "Thunks — the implementation", detail: "Compiler wraps the argument expression in a zero-argument closure (thunk). Each use of the parameter calls the thunk." }
      ],
      code: `// Algol 60 classic — Jensen's Device
// sum(i, n, a[i]) where a[i] is passed BY NAME:
procedure sum(i, n, term):
    result := 0
    for i := 1 to n:
        result := result + term  // re-evaluates a[i] with current i!
    return result

sum(i, 5, a[i])  // computes a[1]+a[2]+a[3]+a[4]+a[5]
                 // impossible with pass-by-value!`
    }
  },

  // SLIDE 14 — PARAMETER COMPARISON  ★ NEW INTERACTIVE DEMO
  {
    id: 14,
    section: "params",
    type: "table",
    title: "Parameter Passing Comparison",
    content: {
      explanation: "The table below summarizes the four parameter modes across four key properties. The most important column is Aliasing — aliasing is the silent source of correctness bugs in pass-by-reference code. The interactive demo below lets you run the same swap(a, b) scenario under each mode so you can see the behavior difference directly.",
      headers: ["Mode", "Copies data?", "Modifies original?", "Aliasing?", "Languages"],
      rows: [
        ["Value",        "Yes (in only)",      "No",               "No",         "C, Java (primitives), Python"],
        ["Reference",    "No",                 "Yes (immediately)", "Yes ⚠️",    "C++ &, Fortran, PHP"],
        ["Value/Result", "Yes (in + out)",     "Yes (at return)",  "No",         "Ada in out"],
        ["Name",         "No (re-evaluates)",  "Depends on expr",  "Complex",    "Algol 60, Haskell lazily"]
      ]
    },
    interactive: { type: "param-comparison" }
  },

  // SLIDE 15 — MACROS VS FUNCTIONS
  {
    id: 15,
    section: "params",
    type: "comparison",
    title: "Macros vs Functions",
    content: {
      explanation: "C preprocessor macros perform textual substitution before compilation — they look like function calls but behave like pass-by-name. The classic hazard is double evaluation: MIN(i++, j++) expands to ((i++)<(j++)?(i++):(j++)), incrementing both variables twice. Inline functions get the performance of inlining (compiler decision) with the safety of real functions: arguments evaluated exactly once, full type checking, and a real name in the debugger.",
      approaches: [
        {
          name: "Macros (#define)",
          code: "#define MIN(a,b) ((a)<(b)?(a):(b))\n// MIN(i++, j++) → DOUBLE INCREMENT BUG",
          characteristics: [
            "Textual substitution before compilation (pass-by-name behavior)",
            "No function call overhead — always inlined",
            "Arguments may be evaluated MULTIPLE TIMES",
            "No type checking — any expression accepted",
            "Hard to debug — no name in the call stack"
          ]
        },
        {
          name: "Inline Functions",
          code: "inline int min(int a, int b) {\n  return a < b ? a : b;\n}",
          characteristics: [
            "Compiler may inline (hint, not a mandate)",
            "Arguments evaluated exactly ONCE — safe",
            "Full type checking at the call site",
            "Has a real name — visible in debuggers and profilers",
            "Smaller binary if the compiler chooses not to inline"
          ]
        }
      ],
      note: "Modern C++: prefer constexpr functions or templates. Rust macros are hygienic — they do not have the double-evaluation problem."
    }
  },

  // SLIDE 16 — LAZY VS EAGER  ★ NEW INTERACTIVE DEMO
  {
    id: 16,
    section: "evaluation",
    type: "comparison",
    title: "Lazy vs Eager Evaluation",
    content: {
      explanation: "Eager (strict) evaluation computes every argument's value before the call happens. Lazy (non-strict) evaluation defers computing an argument until the value is actually needed inside the callee — and caches the result so it is computed at most once (this refinement is called call-by-need). Lazy evaluation makes infinite data structures possible and avoids work when arguments are unused, but makes it harder to reason about when side effects occur.",
      approaches: [
        {
          name: "Eager (Strict) Evaluation",
          characteristics: [
            "All arguments evaluated BEFORE the function is entered",
            "Side effects happen in a predictable, left-to-right order",
            "Unused arguments are still evaluated — wasted work",
            "Easy to reason about: values are concrete at call time"
          ],
          examples: "C, Java, Python, Ruby, JavaScript, most languages"
        },
        {
          name: "Lazy (Non-Strict) Evaluation",
          characteristics: [
            "Arguments evaluated only WHEN their value is demanded",
            "Result is cached after first evaluation (call-by-need)",
            "Can work with infinite data structures (e.g. Haskell [1..])",
            "Side effects may occur at surprising or indeterminate times"
          ],
          examples: "Haskell (default), call-by-name (Algol 60), call-by-need"
        }
      ]
    },
    interactive: { type: "lazy-eager" }
  },

  // SLIDE 17 — EXCEPTION HANDLING
  {
    id: 17,
    section: "exceptions",
    type: "concept",
    title: "Exception Handling",
    content: {
      description: "Non-local control transfer for runtime errors and unusual conditions:",
      explanation: "An exception is a way to transfer control non-locally — bypassing potentially many stack frames — to a designated handler. Unlike a function return, which always goes to the immediate caller, an exception propagates up the call stack until a matching catch block is found. This decouples error-detection code (which may be deep in a library) from error-handling code (which may be in the application). The finally block (and RAII in C++) ensures resources are released even when the non-local jump fires.",
      items: [
        { icon: "⚠️", text: "Exception", detail: "An object describing a runtime error or unusual condition — created at the throw site and propagated upward" },
        { icon: "🎯", text: "Handler (catch)", detail: "A block that matches a thrown exception by type. The nearest matching handler in the call chain wins." },
        { icon: "🔼", text: "Propagation", detail: "Unhandled exceptions bubble up the call stack frame by frame until caught or the program terminates" },
        { icon: "🧹", text: "Cleanup (finally / RAII)", detail: "finally always runs. In C++, destructors of local objects run automatically during unwinding — no finally needed." }
      ],
      code: `try {
    openFile(path);       // may throw IOException
    int n = parseInt(s);  // may throw NumberFormatException
} catch (IOException e) {
    logError(e);
} catch (NumberFormatException e) {
    showDialog("Bad number format");
} finally {
    closeFile();   // ALWAYS runs — even if exception propagates further
}`
    }
  },

  // SLIDE 18 — EXCEPTION IMPLEMENTATION
  {
    id: 18,
    section: "exceptions",
    type: "concept",
    title: "Exception Implementation",
    content: {
      description: "How exceptions work under the hood — zero-cost on the happy path:",
      explanation: "Modern compilers implement exceptions using static handler tables rather than runtime overhead on every try block. Each function that contains a try block gets an entry in a table mapping PC address ranges to handler addresses. When an exception is thrown, the runtime performs a table lookup, runs any destructors for stack-allocated objects (unwinding), and jumps to the handler. Code inside try blocks runs at full speed with no extra instructions. The cost is only paid when an exception is actually thrown — making exceptions the wrong tool for ordinary control flow.",
      items: [
        { icon: "📚", text: "Stack Unwinding", detail: "Runtime walks up the call stack frame by frame, calling destructors (C++) or finally blocks (Java) for each bypassed frame" },
        { icon: "📋", text: "Handler Tables", detail: "Compiler generates a static table mapping (function, PC range) → handler address. Checked at throw time, not at call time." },
        { icon: "⚡", text: "Zero cost when not thrown", detail: "No register spills, no runtime checks inside try blocks. Binary size increases slightly (the table), but speed does not." },
        { icon: "💰", text: "Expensive when thrown", detail: "Table lookup + destructor calls + many frame pops. 10–1000× slower than a normal return. Do not throw in performance-sensitive paths." }
      ]
    }
  },

  // SLIDE 19 — COROUTINES
  {
    id: 19,
    section: "coroutines",
    type: "concept",
    title: "Coroutines",
    content: {
      description: "Subroutines that can suspend their execution and resume from where they left off:",
      explanation: "A normal function call is asymmetric: the caller suspends, the callee runs to completion, then control returns. A coroutine breaks this rule — it can pause mid-execution (yield), return a value to whoever resumed it, and later be resumed to continue from exactly that point with all its local variables intact. This is powerful because the coroutine's local state lives in a heap-allocated frame rather than the call stack. Python generators, JavaScript async/await, C++20 coroutines, and Go goroutines are all built on this idea.",
      items: [
        { icon: "⏸️", text: "Suspend (yield)", detail: "Coroutine saves its entire state (locals, program counter) and returns a value to the caller. Frame is NOT destroyed." },
        { icon: "▶️", text: "Resume (next / send)", detail: "Caller resumes the coroutine from the yield point. All locals are intact. send() can also pass a value back in." },
        { icon: "🔄", text: "Symmetric vs Asymmetric", detail: "Symmetric: any coroutine can transfer to any other. Asymmetric (generators): control always returns to caller on yield." },
        { icon: "📦", text: "Generators & async/await", detail: "Generators yield a sequence of values lazily. async/await is syntactic sugar over coroutines that yield to an event loop." }
      ],
      code: `# Python generator — local state survives across yields
def fibonacci():
    a, b = 0, 1
    while True:
        yield a          # suspend here, return a
        a, b = b, a + b  # resume here next time

fib = fibonacci()
next(fib)  # → 0
next(fib)  # → 1  (a and b are still alive!)
next(fib)  # → 1
next(fib)  # → 2`
    },
    interactive: { type: "coroutines" }
  },

  // SLIDE 20 — SUMMARY
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
            "6-step calling sequence: save, place args, CALL, prologue, body, epilogue",
            "ABI splits registers: caller-save vs callee-save",
            "Leaf routines can eliminate most frame overhead"
          ]
        },
        {
          title: "Parameter Passing",
          points: [
            "By value: safe copy — original unchanged",
            "By reference: alias — immediate modification, beware aliasing",
            "By value/result: copy-in + copy-out, no aliasing",
            "By name: lazy re-evaluation via thunks (Algol 60)"
          ]
        },
        {
          title: "Control Flow",
          points: [
            "Lazy vs eager: when arguments are evaluated",
            "Exceptions: non-local transfer, zero-cost tables",
            "Coroutines: suspend/resume with persistent frame",
            "Generators & async/await built on coroutines"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// EXPLANATION PANEL — shown on every slide that has content.explanation
// ============================================================================
const ExplanationPanel = ({ text }) => (
  <div className="mt-6 bg-slate-800/60 border border-rose-500/20 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-rose-400 text-lg">💡</span>
      <span className="text-rose-400 font-semibold text-base font-mono tracking-wide uppercase text-sm">Explanation</span>
    </div>
    <p className="text-slate-300 text-lg leading-relaxed">{text}</p>
  </div>
);

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Memory Layout Demo
const MemoryLayoutDemo = () => {
  const [highlight, setHighlight] = useState(null);

  const regions = [
    { name: 'Stack',    desc: 'Grows DOWN ↓ — Local variables, parameters, return addresses. Each function call pushes a new frame. Stack overflow occurs when it grows too large.', color: 'rose',   top: true },
    { name: '↓ Free ↑', desc: 'Unused virtual address space between the stack and heap. They grow toward each other. If they collide, you get a stack overflow or heap exhaustion error.', color: 'gray', middle: true },
    { name: 'Heap',     desc: 'Grows UP ↑ — Dynamically allocated memory (malloc/free, new/delete). Lives until explicitly freed (or the GC reclaims it). Objects here can outlive the function that created them.', color: 'amber' },
    { name: 'BSS',      desc: 'Uninitialized global and static variables — zero-initialized by the OS at program start. Takes no space in the binary file itself (the OS provides the zeros).', color: 'green' },
    { name: 'Data',     desc: 'Initialized global and static variables — values stored in the binary file. e.g., int globalMax = 100; Both Data and BSS persist for the entire program lifetime.', color: 'blue' },
    { name: 'Text',     desc: 'Your compiled machine instructions — read-only. The program counter (PC/RIP) always points somewhere in here. Shared between processes running the same program.', color: 'purple' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Program Memory Layout</div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <div className="text-slate-500 text-xs text-center mb-1 font-mono">HIGH ADDRESS ↑</div>
          {regions.map((r, i) => (
            <button key={i} onClick={() => setHighlight(r.name)}
              className={`w-full p-3 rounded text-left transition-all ${
                r.color === 'rose'   ? 'bg-rose-500/30 hover:bg-rose-500/50' :
                r.color === 'gray'   ? 'bg-slate-700/50 hover:bg-slate-700' :
                r.color === 'amber'  ? 'bg-amber-500/30 hover:bg-amber-500/50' :
                r.color === 'green'  ? 'bg-green-500/30 hover:bg-green-500/50' :
                r.color === 'blue'   ? 'bg-blue-500/30 hover:bg-blue-500/50' :
                'bg-purple-500/30 hover:bg-purple-500/50'
              } ${highlight === r.name ? 'ring-2 ring-white' : ''}`}
              style={{ height: r.middle ? '50px' : '44px' }}>
              <span className="font-mono text-base text-white">{r.name}</span>
            </button>
          ))}
          <div className="text-slate-500 text-xs text-center mt-1 font-mono">LOW ADDRESS ↓</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg flex flex-col justify-center">
          {highlight ? (
            <div>
              <div className="text-rose-400 font-bold text-xl mb-3">{highlight}</div>
              <div className="text-slate-300 text-base leading-relaxed">
                {regions.find(r => r.name === highlight)?.desc}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-base">← Click a memory segment to see a detailed description</div>
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
    { desc: 'Program starts — main() is called by the OS', frames: ['main'] },
    { desc: 'main() calls foo(5, 10) — foo\'s frame is pushed', frames: ['main', 'foo(5,10)'] },
    { desc: 'foo() calls bar(5) — bar\'s frame is pushed on top', frames: ['main', 'foo(5,10)', 'bar(5)'] },
    { desc: 'bar() executes RET — its frame is popped, control returns to foo()', frames: ['main', 'foo(5,10)'] },
    { desc: 'foo() executes RET — its frame is popped, control returns to main()', frames: ['main'] }
  ];

  const frameContents = {
    'main':       ['return addr (OS)',  'saved regs',      'local: result'],
    'foo(5,10)':  ['return addr → main','saved FP (RBP)',  'param: a = 5', 'param: b = 10', 'local: x'],
    'bar(5)':     ['return addr → foo', 'saved FP (RBP)',  'param: n = 5', 'local: result']
  };

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Call Stack in Action</div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-slate-400 text-sm mb-2 font-mono">CALL STACK — top frame is active</div>
          <div className="space-y-2">
            {current.frames.slice().reverse().map((frame, i) => (
              <div key={i} className={`p-4 rounded-lg ${
                i === 0 ? 'bg-rose-500/30 border-2 border-rose-500' : 'bg-slate-700/60 border border-slate-600'
              }`}>
                <div className="font-mono text-base text-white mb-2 font-bold">
                  {i === 0 ? '▶ ' : ''}{frame}
                </div>
                <div className="space-y-1">
                  {frameContents[frame]?.map((item, j) => (
                    <div key={j} className="text-slate-400 text-xs font-mono border-t border-slate-600/50 pt-1">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-rose-400 font-bold text-base mb-2 font-mono">Step {step + 1} / {steps.length}</div>
            <div className="text-white text-lg mb-4">{current.desc}</div>
            <div className="text-slate-400 text-sm">Stack depth: <span className="text-rose-400 font-mono">{current.frames.length}</span> frame(s)</div>
          </div>
          <div className="mt-4 bg-slate-800 p-3 rounded-lg text-xs text-slate-400 font-mono leading-relaxed">
            {step === 0 && "RSP points below main's frame. RBP = frame base."}
            {step === 1 && "CALL pushed return addr. Prologue: PUSH RBP; MOV RBP,RSP; SUB RSP,N"}
            {step === 2 && "Another CALL + prologue. Each frame is isolated — locals don't interfere."}
            {step === 3 && "RET: pops return addr, jumps back. Epilogue ran: MOV RSP,RBP; POP RBP"}
            {step === 4 && "Stack is back to initial state. main() resumes right where it left off."}
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-center mt-6">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-base hover:bg-slate-600">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-base disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// ★ NEW: Calling Sequence Demo — slide 5
// Shows the 6-step protocol as annotated x86-64 pseudo-assembly
const CallingSequenceDemo = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      phase: 'CALLER',
      label: 'Save caller-save registers',
      color: 'blue',
      asm: [
        { code: 'PUSH  RCX          ; save loop counter (caller-save)', highlight: true },
        { code: 'PUSH  RSI          ; save pointer we need after call',  highlight: true },
        { code: '                   ; RDI/RAX/RDX — will be clobbered, not saved',  highlight: false },
      ],
      note: 'Caller decides which of its caller-save registers contain live values it still needs after the call. Only those are saved — no point saving dead values.',
    },
    {
      phase: 'CALLER',
      label: 'Place arguments (x86-64 SysV ABI)',
      color: 'blue',
      asm: [
        { code: 'MOV   RDI, rax     ; arg 1  → RDI', highlight: true },
        { code: 'MOV   RSI, rbx     ; arg 2  → RSI', highlight: true },
        { code: 'MOV   RDX, rcx     ; arg 3  → RDX', highlight: true },
        { code: '; args 4,5,6 → RCX, R8, R9', highlight: false },
        { code: '; args 7+  → pushed right-to-left on stack', highlight: false },
      ],
      note: 'The first 6 integer/pointer arguments go in registers (fast — no memory access). Excess arguments are pushed onto the stack in reverse order so arg 7 is at the lowest address.',
    },
    {
      phase: 'CALLER',
      label: 'Execute CALL instruction',
      color: 'blue',
      asm: [
        { code: 'CALL  add          ; equivalent to:', highlight: true },
        { code: '  PUSH  RIP+5      ;   push return address onto stack', highlight: false },
        { code: '  JMP   add        ;   jump to callee\'s first instruction', highlight: false },
      ],
      note: 'CALL is a single instruction that atomically saves the return address (next instruction\'s PC) and transfers control. This is why the return address appears at the top of the new frame.',
    },
    {
      phase: 'CALLEE',
      label: 'Prologue — set up the new frame',
      color: 'rose',
      asm: [
        { code: 'PUSH  RBP          ; save caller\'s frame pointer', highlight: true },
        { code: 'MOV   RBP, RSP     ; RBP now points to base of our frame', highlight: true },
        { code: 'SUB   RSP, 16      ; allocate 16 bytes for local variables', highlight: true },
        { code: 'PUSH  RBX          ; save callee-save reg we will use', highlight: false },
      ],
      note: 'The prologue is 3 instructions for almost every C function. After SUB RSP, locals are accessible at [RBP-8], [RBP-16], etc. Parameters (passed in registers) are already in RDI, RSI, RDX…',
    },
    {
      phase: 'CALLEE',
      label: 'Execute function body',
      color: 'rose',
      asm: [
        { code: '; int add(int a, int b) { return a + b; }', highlight: false },
        { code: 'MOV   EAX, EDI     ; EAX = a  (arg 1 was in RDI)', highlight: true },
        { code: 'ADD   EAX, ESI     ; EAX = a + b  (arg 2 was in RSI)', highlight: true },
        { code: '; result is now in EAX — the return value register', highlight: false },
      ],
      note: 'The function body accesses its parameters directly from the registers where they arrived. Return value is placed in RAX (EAX for 32-bit int). Local variables are at negative offsets from RBP.',
    },
    {
      phase: 'CALLEE',
      label: 'Epilogue & RET — restore and return',
      color: 'green',
      asm: [
        { code: 'POP   RBX          ; restore callee-save register', highlight: false },
        { code: 'MOV   RSP, RBP     ; collapse local variable space', highlight: true },
        { code: 'POP   RBP          ; restore caller\'s frame pointer', highlight: true },
        { code: 'RET                ; pop return address → jump to caller', highlight: true },
      ],
      note: 'RET pops the return address that CALL pushed and jumps to it. The caller\'s frame pointer and stack pointer are fully restored. Caller resumes immediately after the CALL instruction.',
    },
  ];

  const cur = steps[activeStep];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Calling Sequence — x86-64 Assembly</div>

      {/* Step selector */}
      <div className="flex flex-wrap gap-2 mb-5 justify-center">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setActiveStep(i)}
            className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
              activeStep === i
                ? s.color === 'blue'  ? 'bg-blue-500  text-white'
                : s.color === 'rose'  ? 'bg-rose-500  text-white'
                :                       'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>
            {i + 1}. {s.label.split(' — ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Assembly panel */}
        <div className="col-span-3 bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-mono px-2 py-1 rounded font-bold ${
              cur.color === 'blue'  ? 'bg-blue-500/30  text-blue-300'  :
              cur.color === 'rose'  ? 'bg-rose-500/30  text-rose-300'  :
                                      'bg-green-500/30 text-green-300'
            }`}>{cur.phase}</span>
            <span className="text-white text-base font-semibold">{cur.label}</span>
          </div>
          <div className="space-y-1">
            {cur.asm.map((line, j) => (
              <div key={j} className={`font-mono text-sm px-3 py-1.5 rounded ${
                line.highlight
                  ? cur.color === 'blue'  ? 'bg-blue-500/20  text-blue-200  border-l-2 border-blue-400'  :
                    cur.color === 'rose'  ? 'bg-rose-500/20  text-rose-200  border-l-2 border-rose-400'  :
                                            'bg-green-500/20 text-green-200 border-l-2 border-green-400'
                  : 'text-slate-500'
              }`}>
                {line.code}
              </div>
            ))}
          </div>
        </div>

        {/* Explanation panel */}
        <div className="col-span-2 bg-slate-900 rounded-lg p-4 flex flex-col">
          <div className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">Why this step matters</div>
          <p className="text-slate-300 text-sm leading-relaxed flex-1">{cur.note}</p>
          <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-500 font-mono">
            Step {activeStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-5">
        <button onClick={() => setActiveStep(0)} className="px-4 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600">Reset</button>
        <button onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0}
          className="px-4 py-2 bg-slate-700 rounded text-sm disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))} disabled={activeStep >= steps.length - 1}
          className="px-4 py-2 bg-rose-600 rounded text-sm disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// L-value vs R-value Demo
const LvalueRvalueDemo = () => {
  const examples = [
    { expr: 'x',     lvalue: true,  rvalue: true,  reason: 'Named variable — has a stable stack address. Can be read and assigned.', usage: 'x = 5;  // ✓   y = x;  // ✓' },
    { expr: 'x + 3', lvalue: false, rvalue: true,  reason: 'Arithmetic result — computed in a temporary register. No persistent address.', usage: '// (x+3) = 5; ERROR\n// y = x+3;  ✓' },
    { expr: '*p',    lvalue: true,  rvalue: true,  reason: 'Dereferenced pointer — directly names the memory cell p points to.', usage: '*p = 99;  // ✓   y = *p;  // ✓' },
    { expr: '&x',    lvalue: false, rvalue: true,  reason: 'Address-of x — produces the address as a value. The result is itself not a location.', usage: 'int* p = &x;  // ✓\n// &(&x) ERROR' },
    { expr: 'a[i]',  lvalue: true,  rvalue: true,  reason: 'Array element — compiler computes base+i*size; the result names a specific memory cell.', usage: 'a[i] = 7;  // ✓   z = a[i];  // ✓' },
    { expr: '42',    lvalue: false, rvalue: true,  reason: 'Integer literal — a constant baked into the instruction stream. No address exists.', usage: '// 42 = x; ERROR\n// y = 42;  ✓' }
  ];

  const [selected, setSelected] = useState(0);
  const current = examples[selected];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: L-values vs R-values</div>
      <div className="flex flex-wrap gap-2 mb-5 justify-center">
        {examples.map((ex, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`px-4 py-2 rounded-lg font-mono text-base ${
              selected === i ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>
            {ex.expr}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${current.lvalue ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
          <div className={`text-xl font-bold ${current.lvalue ? 'text-green-400' : 'text-red-400'}`}>
            {current.lvalue ? '✓ L-value' : '✗ Not an L-value'}
          </div>
          <div className="text-slate-300 text-base mt-1">
            {current.lvalue ? 'Has a memory address — can be assigned to' : 'No persistent address — cannot be assigned to'}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
          <div className="text-xl font-bold text-green-400">✓ R-value</div>
          <div className="text-slate-300 text-base mt-1">Every expression is an r-value — it can always be read</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-xs font-mono uppercase mb-2">Reason</div>
          <span className="text-rose-400 font-mono text-lg font-bold">{current.expr}</span>
          <p className="text-slate-300 text-base mt-2">{current.reason}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-xs font-mono uppercase mb-2">Usage Examples</div>
          <pre className="text-green-400 font-mono text-sm whitespace-pre">{current.usage}</pre>
        </div>
      </div>
    </div>
  );
};

// Pass by Value Demo
const PassByValueDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'Before call: a = 5 in caller\'s frame', a: 5, x: null, phase: 'before' },
    { desc: 'CALL: x receives a COPY of a. Both hold 5, but in different memory locations.', a: 5, x: 5, phase: 'copy' },
    { desc: 'Inside callee: x = x + 1 → x becomes 6. a is untouched.', a: 5, x: 6, phase: 'modify' },
    { desc: 'After return: x\'s frame is gone. a is still 5 — the copy was modified, not a.', a: 5, x: null, phase: 'after' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Pass by Value</div>
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-base">
        <span className="text-rose-400">void</span> increment(<span className="text-blue-400">int</span> x) {'{ '}x = x + 1;{' }'}
        <span className="text-slate-500 ml-4">// x is a LOCAL COPY</span>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="bg-slate-900 p-5 rounded-lg text-center">
          <div className="text-slate-400 text-sm mb-1 font-mono">CALLER'S variable</div>
          <div className="text-5xl font-mono font-bold text-blue-400">a = {current.a}</div>
          <div className="text-slate-500 text-xs mt-2 font-mono">address: 0x7ff…a0</div>
        </div>
        <div className={`p-5 rounded-lg text-center transition-all ${current.x !== null ? 'bg-rose-500/20 border border-rose-500' : 'bg-slate-900 border border-slate-700'}`}>
          <div className="text-slate-400 text-sm mb-1 font-mono">CALLEE'S parameter (copy)</div>
          <div className={`text-5xl font-mono font-bold ${current.x === 6 ? 'text-green-400' : 'text-rose-400'}`}>
            x = {current.x !== null ? current.x : '—'}
          </div>
          <div className="text-slate-500 text-xs mt-2 font-mono">{current.x !== null ? 'address: 0x7ff…b4 (different!)' : '(not yet allocated)'}</div>
        </div>
      </div>
      <div className="bg-rose-500/15 border border-rose-500/30 p-4 rounded-lg mb-4">
        <div className="text-rose-300 text-base">{current.desc}</div>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-base hover:bg-slate-600">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-base disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// Pass by Reference Demo
const PassByReferenceDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'Before call: a = 5 in caller\'s frame', a: 5, phase: 'before', arrow: false },
    { desc: 'CALL: x is an ALIAS for a — x stores the address of a, not a copy of its value.', a: 5, phase: 'alias', arrow: true },
    { desc: 'Inside callee: x = x + 1 writes through the alias — a is modified immediately!', a: 6, phase: 'modify', arrow: true },
    { desc: 'After return: a is now 6. The caller\'s variable was changed.', a: 6, phase: 'after', arrow: false }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Pass by Reference</div>
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-base">
        <span className="text-rose-400">void</span> increment(<span className="text-blue-400">int</span><span className="text-green-400">&amp;</span> x) {'{ '}x = x + 1;{' }'}
        <span className="text-slate-500 ml-4">// x is an ALIAS</span>
      </div>
      <div className="flex items-center justify-center gap-6 mb-4 min-h-[100px]">
        <div className="bg-slate-900 p-5 rounded-lg text-center">
          <div className="text-slate-400 text-sm mb-1 font-mono">Variable a</div>
          <div className={`text-5xl font-mono font-bold transition-colors ${current.a === 6 ? 'text-green-400' : 'text-blue-400'}`}>
            {current.a}
          </div>
          <div className="text-slate-500 text-xs mt-1 font-mono">0x7ff…a0</div>
        </div>
        {current.arrow && (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="text-rose-400 text-2xl">↔</div>
              <div className="text-rose-400 text-xs font-mono">same memory</div>
            </div>
            <div className="bg-rose-500/25 border border-rose-500 p-5 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1 font-mono">Parameter x (alias)</div>
              <div className="text-rose-300 text-base font-mono">holds address 0x7ff…a0</div>
              <div className="text-rose-400 text-sm mt-1">→ points to a</div>
            </div>
          </>
        )}
      </div>
      <div className="bg-green-500/15 border border-green-500/30 p-4 rounded-lg mb-4">
        <div className="text-green-300 text-base">{current.desc}</div>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-base hover:bg-slate-600">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-base disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// ★ NEW: Parameter Passing Comparison Demo — slide 14
// Runs swap(a, b) and swap(a, a) under each mode, showing the difference
const ParamComparisonDemo = () => {
  const [mode, setMode] = useState('value');
  const [scenario, setScenario] = useState('normal');

  const scenarios = {
    normal: { aInit: 3, bInit: 7, label: 'swap(a, b)  — normal swap' },
    alias:  { aInit: 3, bInit: 3, label: 'swap(a, a)  — aliasing scenario' },
  };

  const { aInit, bInit, label } = scenarios[scenario];

  const results = {
    value: {
      steps: [
        { a: aInit, b: bInit, x: null, y: null,  note: 'Initial state.' },
        { a: aInit, b: bInit, x: aInit, y: bInit, note: 'By Value: x = copy of a, y = copy of b.' },
        { a: aInit, b: bInit, x: bInit, y: aInit, note: 'swap runs on x and y (local copies).' },
        { a: aInit, b: bInit, x: null, y: null,  note: 'Return — copies are discarded. a and b unchanged!' },
      ],
      verdict: scenario === 'normal' ? '❌ Swap failed — originals unchanged' : '❌ Swap failed — originals unchanged',
    },
    reference: {
      steps: [
        { a: aInit,  b: bInit,  x: null,  y: null,  note: 'Initial state.' },
        { a: aInit,  b: bInit,  x: '→a',  y: '→b',  note: 'By Reference: x aliases a, y aliases b.' },
        { a: bInit,  b: aInit,  x: '→a',  y: '→b',  note: scenario === 'normal'
            ? 'swap modifies through aliases — a and b both changed!'
            : 'swap(a,a): x and y BOTH alias a. After temp=x: temp=3. After x=y: a=3 (unchanged). After y=temp: a=3. Result is wrong.' },
        { a: scenario === 'normal' ? bInit : aInit,
          b: scenario === 'normal' ? aInit : aInit,
          x: null, y: null,
          note: scenario === 'normal' ? 'Return — swap succeeded.' : 'Return — a unchanged due to aliasing bug.' },
      ],
      verdict: scenario === 'normal' ? '✅ Swap succeeded' : '❌ Aliasing bug — a unchanged',
    },
    valueresult: {
      steps: [
        { a: aInit, b: bInit, x: null,  y: null,  note: 'Initial state.' },
        { a: aInit, b: bInit, x: aInit, y: bInit, note: 'Copy-In: x = copy of a, y = copy of b.' },
        { a: aInit, b: bInit, x: bInit, y: aInit, note: 'swap runs on x and y (independent copies, no aliasing).' },
        { a: bInit, b: aInit, x: null,  y: null,  note: 'Copy-Out on return: x copied back to a, y copied back to b. Swap succeeded, and no aliasing issue!' },
      ],
      verdict: scenario === 'normal' ? '✅ Swap succeeded' : '✅ swap(a,a) result: a stays the same (well-defined)',
    },
  };

  const [stepIdx, setStepIdx] = useState(0);
  const modeSteps = results[mode].steps;
  const cur = modeSteps[Math.min(stepIdx, modeSteps.length - 1)];

  const handleModeChange = (m) => { setMode(m); setStepIdx(0); };
  const handleScenarioChange = (s) => { setScenario(s); setStepIdx(0); };

  const modeColor = mode === 'value' ? 'blue' : mode === 'reference' ? 'rose' : 'green';

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-5 font-mono">Interactive: swap(x, y) under each parameter mode</div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {[['value','By Value','blue'], ['reference','By Reference','rose'], ['valueresult','Value/Result','green']].map(([m, label, c]) => (
          <button key={m} onClick={() => handleModeChange(m)}
            className={`px-4 py-2 rounded-lg text-base font-semibold transition-all ${
              mode === m
                ? c === 'blue'  ? 'bg-blue-500  text-white'
                : c === 'rose'  ? 'bg-rose-500  text-white'
                :                 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>{label}</button>
        ))}
      </div>

      {/* Scenario selector */}
      <div className="flex gap-2 mb-5 justify-center">
        {[['normal','swap(a, b)  — normal'], ['alias','swap(a, a)  — aliasing']].map(([s, l]) => (
          <button key={s} onClick={() => handleScenarioChange(s)}
            className={`px-3 py-1.5 rounded text-sm font-mono ${
              scenario === s ? 'bg-amber-500/30 text-amber-300 border border-amber-500' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}>{l}</button>
        ))}
      </div>

      {/* Code display */}
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-sm">
        <span className="text-slate-500">// void swap(T x, T y) — body is always: temp=x; x=y; y=temp;</span><br/>
        <span className="text-slate-400">// Scenario: </span><span className="text-amber-300">{label}</span><br/>
        <span className="text-slate-400">// a = </span><span className="text-blue-300">{aInit}</span>
        <span className="text-slate-400">,  b = </span><span className="text-blue-300">{bInit}</span>
      </div>

      {/* State visualization */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'a', val: cur.a, color: 'blue' },
          { label: 'b', val: scenario === 'alias' ? cur.a : cur.b, color: 'blue' },
          { label: 'x (param)', val: cur.x, color: modeColor },
          { label: 'y (param)', val: scenario === 'alias' && mode === 'reference' ? cur.x : cur.y, color: modeColor },
        ].map((item, i) => (
          <div key={i} className={`rounded-lg p-3 text-center ${
            item.val === null ? 'bg-slate-900 border border-slate-700' :
            item.color === 'blue'  ? 'bg-blue-500/20  border border-blue-500'  :
            item.color === 'rose'  ? 'bg-rose-500/20  border border-rose-500'  :
                                     'bg-green-500/20 border border-green-500'
          }`}>
            <div className="text-slate-400 text-xs font-mono mb-1">{item.label}</div>
            <div className={`text-2xl font-mono font-bold ${
              item.val === null ? 'text-slate-600' :
              item.color === 'blue'  ? 'text-blue-300'  :
              item.color === 'rose'  ? 'text-rose-300'  :
                                       'text-green-300'
            }`}>{item.val === null ? '—' : item.val}</div>
          </div>
        ))}
      </div>

      {/* Step note */}
      <div className="bg-slate-900 p-4 rounded-lg mb-4 min-h-[60px] flex items-center">
        <p className="text-slate-300 text-base">
          <span className="text-rose-400 font-mono font-bold mr-2">Step {stepIdx + 1}:</span>
          {cur.note}
        </p>
      </div>

      {/* Verdict (on last step) */}
      {stepIdx === modeSteps.length - 1 && (
        <div className={`p-3 rounded-lg text-center font-semibold text-base mb-4 ${
          results[mode].verdict.startsWith('✅') ? 'bg-green-500/20 text-green-300 border border-green-500' :
                                                    'bg-red-500/20   text-red-300   border border-red-500'
        }`}>
          {results[mode].verdict}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStepIdx(0)} className="px-4 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600">Reset</button>
        <button onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}
          className="px-4 py-2 bg-slate-700 rounded text-sm disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStepIdx(s => Math.min(modeSteps.length - 1, s + 1))} disabled={stepIdx >= modeSteps.length - 1}
          className="px-4 py-2 bg-rose-600 rounded text-sm disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// ★ NEW: Lazy vs Eager Evaluation Demo — slide 16
// Runs a concrete example under both strategies and shows evaluation order
const LazyEagerDemo = () => {
  const [mode, setMode] = useState('eager');
  const [step, setStep] = useState(0);

  // Example: f(expensiveCompute(), unusedArg())
  // where unusedArg() has a side effect we can observe
  const scenarios = {
    eager: [
      { label: 'Start', note: 'We are about to call:  printFirst(getA(), getB())\ngetA() returns 42; getB() has a side effect (prints "B evaluated") and returns 99.', evalA: false, evalB: false, called: false },
      { label: 'Eval getA()', note: 'EAGER: getA() is evaluated FIRST (left-to-right). Returns 42. Side effects of getA() happen now.', evalA: true, evalB: false, called: false },
      { label: 'Eval getB()', note: 'EAGER: getB() is evaluated SECOND, even though the function body may not need it. Side effect fires now.', evalA: true, evalB: true, called: false },
      { label: 'Call function', note: 'Both arguments are now concrete values (42, 99). The function is entered with x=42, y=99.', evalA: true, evalB: true, called: true },
      { label: 'Body: print x only', note: 'Function only uses x. y is never read — but we already paid to evaluate getB(). Wasted work!', evalA: true, evalB: true, called: true, bodyRan: true },
    ],
    lazy: [
      { label: 'Start', note: 'We are about to call:  printFirst(getA(), getB())\nLazy evaluation: arguments are NOT evaluated yet. Thunks are created instead.', evalA: false, evalB: false, called: false },
      { label: 'Enter function', note: 'LAZY: The function is entered immediately, before any argument is evaluated. x and y are thunks (zero-argument functions).', evalA: false, evalB: false, called: true },
      { label: 'Body demands x', note: 'Body executes "print x" — this DEMANDS x\'s value. The thunk for getA() is called now. Returns 42. Result is cached.', evalA: true, evalB: false, called: true, bodyRan: true },
      { label: 'Body never uses y', note: 'Function returns without ever reading y. The thunk for getB() is NEVER called. Side effect never fires. Work saved!', evalA: true, evalB: false, called: true, bodyRan: true, done: true },
    ],
  };

  const curSteps = scenarios[mode];
  const cur = curSteps[Math.min(step, curSteps.length - 1)];

  const handleModeChange = (m) => { setMode(m); setStep(0); };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-5 font-mono">Interactive: Lazy vs Eager — when do arguments get evaluated?</div>

      {/* Mode toggle */}
      <div className="flex gap-3 mb-5 justify-center">
        <button onClick={() => handleModeChange('eager')}
          className={`px-6 py-2.5 rounded-lg text-base font-bold ${mode === 'eager' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
          Eager (Strict)
        </button>
        <button onClick={() => handleModeChange('lazy')}
          className={`px-6 py-2.5 rounded-lg text-base font-bold ${mode === 'lazy' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
          Lazy (Non-Strict)
        </button>
      </div>

      {/* Code */}
      <div className="bg-slate-900 p-4 rounded-lg mb-5 font-mono text-sm">
        <span className="text-slate-500">// Function only uses its first argument:</span><br/>
        <span className="text-blue-300">void</span> <span className="text-green-300">printFirst</span>(<span className="text-blue-300">int</span> x, <span className="text-blue-300">int</span> y) {'{'}<br/>
        <span className="ml-4 text-white">print(x);</span><span className="text-slate-500 ml-4">// y is never used</span><br/>
        {'}'}<br/><br/>
        <span className="text-amber-300">printFirst</span>(getA(), getB());
        <span className="text-slate-500 ml-4">// getB() has a side-effect!</span>
      </div>

      {/* Evaluation timeline */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { id: 'evalA',  label: 'getA() evaluated', flag: cur.evalA,   color: 'blue',   detail: '→ returns 42' },
          { id: 'evalB',  label: 'getB() evaluated', flag: cur.evalB,   color: mode === 'eager' ? 'amber' : 'red', detail: mode === 'eager' ? '→ side-effect fires!' : '→ NEVER called ✓' },
          { id: 'called', label: 'Function entered',  flag: cur.called,  color: 'green',  detail: 'body starts running' },
        ].map(item => (
          <div key={item.id} className={`rounded-lg p-3 text-center transition-all ${
            item.flag
              ? item.color === 'blue'  ? 'bg-blue-500/30   border border-blue-400'  :
                item.color === 'amber' ? 'bg-amber-500/30  border border-amber-400' :
                item.color === 'red'   ? 'bg-red-500/20    border border-red-500'   :
                                         'bg-green-500/30  border border-green-500'
              : 'bg-slate-900 border border-slate-700 opacity-40'
          }`}>
            <div className={`text-xl mb-1 ${item.flag ? '' : 'grayscale opacity-50'}`}>
              {item.flag ? '✅' : '⬜'}
            </div>
            <div className="text-white text-xs font-mono">{item.label}</div>
            {item.flag && <div className="text-slate-300 text-xs mt-1">{item.detail}</div>}
          </div>
        ))}
      </div>

      {/* Step note */}
      <div className={`p-4 rounded-lg mb-4 min-h-[80px] flex items-start gap-3 ${
        mode === 'eager' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-purple-500/10 border border-purple-500/30'
      }`}>
        <span className={`text-lg flex-shrink-0 ${mode === 'eager' ? 'text-blue-400' : 'text-purple-400'}`}>
          {mode === 'eager' ? '⚡' : '😴'}
        </span>
        <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{cur.note}</p>
      </div>

      {/* Verdict on last step */}
      {step === curSteps.length - 1 && (
        <div className={`p-3 rounded-lg text-center font-semibold text-sm mb-4 ${
          mode === 'eager'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
            : 'bg-green-500/20 text-green-300 border border-green-500'
        }`}>
          {mode === 'eager'
            ? '⚠️ Eager: getB() was evaluated even though y was never used — side effect fired, work wasted'
            : '✅ Lazy: getB() was NEVER evaluated — side effect suppressed, work saved'}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-700 rounded text-sm disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStep(s => Math.min(curSteps.length - 1, s + 1))} disabled={step >= curSteps.length - 1}
          className="px-4 py-2 bg-rose-600 rounded text-sm disabled:opacity-40 hover:bg-rose-500">Next →</button>
      </div>
    </div>
  );
};

// Coroutines Demo (enhanced with Fibonacci + clearer state display)
const CoroutinesDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { a: 0,  b: 1,  yielded: null, caller: 'fib = fibonacci()\nnext(fib)', genState: 'running',   note: 'Generator is created and first next() is called. Execution begins at the top of the function body.' },
    { a: 1,  b: 1,  yielded: 0,   caller: 'received → 0',               genState: 'suspended', note: 'yield 0: execution suspends here. The value 0 is returned to the caller. a and b are FROZEN in the generator\'s frame.' },
    { a: 1,  b: 1,  yielded: null, caller: 'next(fib)',                  genState: 'running',   note: 'Caller calls next() again. Execution RESUMES exactly at the yield statement. a and b still have their old values.' },
    { a: 1,  b: 2,  yielded: 1,   caller: 'received → 1',               genState: 'suspended', note: 'a, b = b, a+b runs: a=1, b=1. Then yield 1. Suspended again with the new a and b saved.' },
    { a: 2,  b: 3,  yielded: 1,   caller: 'received → 1',               genState: 'suspended', note: 'Resumed, a, b = 1, 2. yield 1. Values persist across the yield — this is the key power of coroutines.' },
    { a: 3,  b: 5,  yielded: 2,   caller: 'received → 2',               genState: 'suspended', note: 'a, b = 2, 3. yield 2. The Fibonacci sequence builds correctly because state is preserved between yields.' },
  ];

  const cur = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-rose-400 text-lg mb-4 font-mono">Interactive: Fibonacci Generator (Coroutine)</div>

      <div className="bg-slate-900 p-4 rounded-lg mb-5 font-mono text-sm leading-relaxed">
        <span className="text-rose-400">def</span> <span className="text-green-300">fibonacci</span>():<br/>
        <span className="ml-4 text-slate-400">a, b = 0, 1</span><br/>
        <span className="ml-4 text-rose-400">while</span> <span className="text-blue-300">True</span>:<br/>
        <span className="ml-8 text-amber-300">yield</span> <span className="text-slate-300">a</span>
        <span className="text-slate-500 ml-4">  # ← suspend here, return a</span><br/>
        <span className="ml-8 text-slate-300">a, b = b, a + b</span>
        <span className="text-slate-500 ml-4">  # resume here next time</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Generator state */}
        <div className={`p-4 rounded-lg border ${cur.genState === 'running' ? 'bg-green-500/20 border-green-500' : 'bg-amber-500/20 border-amber-500'}`}>
          <div className="text-slate-400 text-xs font-mono uppercase mb-2">Generator State</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{cur.genState === 'running' ? '▶' : '⏸'}</span>
            <span className={`font-bold text-lg ${cur.genState === 'running' ? 'text-green-300' : 'text-amber-300'}`}>
              {cur.genState === 'running' ? 'Running' : 'Suspended'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/60 rounded p-2 text-center">
              <div className="text-slate-500 text-xs font-mono">a</div>
              <div className="text-white font-mono font-bold text-xl">{cur.a}</div>
            </div>
            <div className="bg-slate-900/60 rounded p-2 text-center">
              <div className="text-slate-500 text-xs font-mono">b</div>
              <div className="text-white font-mono font-bold text-xl">{cur.b}</div>
            </div>
          </div>
          {cur.yielded !== null && (
            <div className="mt-3 bg-rose-500/20 rounded p-2 text-center">
              <span className="text-slate-400 text-xs font-mono">yielded → </span>
              <span className="text-rose-300 font-mono font-bold text-xl">{cur.yielded}</span>
            </div>
          )}
        </div>

        {/* Caller state */}
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-xs font-mono uppercase mb-2">Caller</div>
          <pre className="text-blue-300 font-mono text-base whitespace-pre-wrap">{cur.caller}</pre>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-slate-500 text-xs font-mono">Sequence so far:</div>
            <div className="text-slate-300 font-mono text-sm mt-1">
              {steps.slice(0, step + 1).filter(s => s.yielded !== null).map(s => s.yielded).join(', ')}
              {steps.slice(0, step + 1).some(s => s.yielded !== null) ? ', …' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg mb-4">
        <p className="text-purple-200 text-sm leading-relaxed">{cur.note}</p>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-base hover:bg-slate-600">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-base disabled:opacity-40 hover:bg-slate-600">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-rose-600 rounded text-base disabled:opacity-40 hover:bg-rose-500">Next →</button>
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
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.description && (
      <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>
    )}
    {slide.content.items && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slide.content.items.map((item, i) => (
          <div key={i} className="bg-slate-800/50 p-5 rounded-xl flex items-start gap-4">
            {item.icon && <span className="text-4xl flex-shrink-0">{item.icon}</span>}
            <div>
              <p className="text-white font-semibold text-xl">{item.text}</p>
              {item.detail && <p className="text-slate-300 text-base mt-1">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    )}
    {slide.content.code && (
      <div className="mt-5 bg-slate-900 p-5 rounded-xl border border-slate-700">
        <pre className="text-green-400 font-mono text-base whitespace-pre-wrap leading-relaxed">{slide.content.code}</pre>
      </div>
    )}
    {slide.content.explanation && <ExplanationPanel text={slide.content.explanation} />}
    {slide.content.note && <p className="mt-5 text-rose-400 italic text-lg">{slide.content.note}</p>}
    {slide.interactive?.type === 'memory-layout'      && <MemoryLayoutDemo />}
    {slide.interactive?.type === 'stack-frame'        && <StackFrameDemo />}
    {slide.interactive?.type === 'calling-sequence'   && <CallingSequenceDemo />}
    {slide.interactive?.type === 'lvalue-rvalue'      && <LvalueRvalueDemo />}
    {slide.interactive?.type === 'pass-by-value'      && <PassByValueDemo />}
    {slide.interactive?.type === 'pass-by-reference'  && <PassByReferenceDemo />}
    {slide.interactive?.type === 'coroutines'         && <CoroutinesDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-4 ${i === 0 ? 'text-blue-400' : 'text-green-400'}`}>{a.name}</h3>
          {a.code && (
            <pre className="text-green-400 font-mono text-sm mb-4 bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">{a.code}</pre>
          )}
          {a.characteristics && (
            <ul className="space-y-2">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-lg">• {c}</li>
              ))}
            </ul>
          )}
          {a.examples && <p className="text-slate-500 text-sm mt-3 font-mono">Examples: {a.examples}</p>}
        </div>
      ))}
    </div>
    {slide.content.explanation && <ExplanationPanel text={slide.content.explanation} />}
    {slide.content.note && <p className="mt-5 text-rose-400 text-lg italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'lazy-eager' && <LazyEagerDemo />}
  </div>
);

const TableSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-6">{slide.title}</h2>
    {slide.content.explanation && <ExplanationPanel text={slide.content.explanation} />}
    <div className="overflow-x-auto mt-5">
      <table className="w-full text-lg">
        <thead>
          <tr className="border-b-2 border-rose-500/50">
            {slide.content.headers?.map((h, i) => (
              <th key={i} className="text-left p-4 text-rose-400 font-bold text-base uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.content.rows?.map((row, i) => (
            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`p-4 ${
                  j === 0 ? 'text-white font-bold font-mono text-lg' :
                  cell.includes('⚠️') ? 'text-amber-400 font-semibold' :
                  cell === 'No'  ? 'text-rose-400'  :
                  cell === 'Yes (immediately)' ? 'text-green-400 font-semibold' :
                  cell.startsWith('Yes') ? 'text-green-400' :
                  'text-slate-300'
                } text-base`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {slide.interactive?.type === 'param-comparison' && <ParamComparisonDemo />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-rose-400 font-bold text-2xl mb-5">{section.title}</h3>
          <ul className="space-y-3">
            {section.points.map((point, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg flex-shrink-0">✓</span>
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
    case 'title':      return <TitleSlide      slide={slide} />;
    case 'concept':    return <ConceptSlide    slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'table':      return <TableSlide      slide={slide} />;
    case 'summary':    return <SummarySlide    slide={slide} />;
    default:           return <ConceptSlide    slide={slide} />;
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
    // ── NEXT ──────────────────────────────────────────────────────────────────
    // ArrowRight / Space  — built-in keyboard nav
    // PageDown            — Logitech R400/R800, Kensington Expert, most clickers
    // Period (.)          — Logitech Spotlight "next" in some firmware modes
    // F5                  — some clickers' "start presentation" repurposed as next
    const NEXT_KEYS = ['ArrowRight', ' ', 'PageDown', '.', 'F5'];

    // ── PREVIOUS ──────────────────────────────────────────────────────────────
    // ArrowLeft           — built-in keyboard nav
    // PageUp              — Logitech R400/R800, Kensington Expert, most clickers
    // Backspace           — some cheaper clickers send this for "back"
    const PREV_KEYS = ['ArrowLeft', 'PageUp', 'Backspace'];

    if (NEXT_KEYS.includes(e.key)) {
      // Prevent PageDown/Space from also scrolling the page
      if (['PageDown', ' ', 'PageUp'].includes(e.key)) e.preventDefault();
      setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1));
    } else if (PREV_KEYS.includes(e.key)) {
      if (e.key === 'PageUp') e.preventDefault();
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
            <span className="text-rose-400 font-bold text-lg">Ch 9: {CHAPTER_CONFIG.title}</span>
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

      {/* Slide menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 p-4 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Chapter 9 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-rose-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id}
                    onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
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
            className="flex items-center gap-2 px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-30 hover:bg-slate-600">
            ← Previous
          </button>
          <div className="flex-1 mx-8">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-300"
                   style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 rounded text-lg disabled:opacity-30 hover:bg-rose-500">
            Next →
          </button>
        </div>
        <div className="text-center text-slate-500 text-sm pb-2">
          <kbd className="px-2 py-1 bg-slate-700 rounded">←</kbd>{' '}
          <kbd className="px-2 py-1 bg-slate-700 rounded">→</kbd>{' '}
          <kbd className="px-2 py-1 bg-slate-700 rounded">PgUp</kbd>{' '}
          <kbd className="px-2 py-1 bg-slate-700 rounded">PgDn</kbd> navigate •{' '}
          <kbd className="px-2 py-1 bg-slate-700 rounded">M</kbd> menu •{' '}
          🖱 clicker supported
          <p className="mt-1">&copy; {new Date().getFullYear()} Dr. Qi Li. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 5: TARGET MACHINE ARCHITECTURE
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 5,
  title: "Target Machine Architecture",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#f59e0b" // amber/orange
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
    title: "Chapter 5: Target Machine Architecture",
    content: {
      subtitle: "Understanding the Hardware for Better Compilation",
      topics: [
        "Von Neumann Architecture",
        "Memory Hierarchy",
        "Data Representation",
        "Instruction Sets",
        "RISC vs CISC",
        "Pipelining & Modern Processors"
      ]
    }
  },

  // WHY STUDY ARCHITECTURE
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Why Study Machine Architecture?",
    content: {
      description: "Understanding hardware helps us understand compilation:",
      items: [
        { icon: "🎯", text: "What the compiler must do", detail: "Translate high-level code to machine instructions" },
        { icon: "⚡", text: "Why some things are fast", detail: "Register access vs memory access" },
        { icon: "🐢", text: "Why some things are slow", detail: "Cache misses, pipeline stalls, branch mispredictions" },
        { icon: "🔧", text: "Optimization opportunities", detail: "Instruction scheduling, register allocation" }
      ]
    }
  },

  // VON NEUMANN ARCHITECTURE
  {
    id: 3,
    section: "basics",
    type: "concept",
    title: "Von Neumann Architecture",
    content: {
      description: "The stored program concept - foundation of modern computers:",
      items: [
        { icon: "💾", text: "Stored Program", detail: "Instructions and data both stored in memory as bits" },
        { icon: "🔄", text: "Fetch-Execute Cycle", detail: "Continuously fetch instruction, decode, execute, store result" },
        { icon: "📍", text: "Program Counter (PC)", detail: "Points to next instruction to execute" },
        { icon: "🎛️", text: "Untyped Memory", detail: "Bits are just bits - operations give them meaning" }
      ]
    },
    interactive: { type: "fetch-execute" }
  },

  // FETCH-EXECUTE CYCLE
  {
    id: 4,
    section: "basics",
    type: "diagram",
    title: "The Fetch-Execute Cycle",
    content: {
      description: "What the processor does, over and over, at furious pace:",
      steps: [
        { name: "Fetch Instruction", detail: "Read instruction from memory at PC address" },
        { name: "Decode", detail: "Figure out what the instruction says to do" },
        { name: "Fetch Operands", detail: "Get data from registers or memory" },
        { name: "Execute", detail: "Perform the operation (ALU, etc.)" },
        { name: "Store Result", detail: "Write result back to register or memory" },
        { name: "Update PC", detail: "Move to next instruction (usually PC++)" }
      ]
    },
    interactive: { type: "fetch-execute-cycle" }
  },

  // PROCESSOR COMPONENTS
  {
    id: 5,
    section: "basics",
    type: "concept",
    title: "Processor Components",
    content: {
      description: "Key functional units inside a typical processor:",
      items: [
        { icon: "🧠", text: "Control Unit", detail: "Decodes instructions, drives other units" },
        { icon: "➕", text: "ALU (Arithmetic Logic Unit)", detail: "Performs arithmetic and logical operations" },
        { icon: "📦", text: "Registers", detail: "Fast on-chip storage for active data" },
        { icon: "🚌", text: "Bus Interface", detail: "Connects to memory and I/O devices" }
      ]
    }
  },

  // MEMORY HIERARCHY
  {
    id: 6,
    section: "memory",
    type: "concept",
    title: "Memory Hierarchy",
    content: {
      description: "Faster memory is smaller and more expensive:",
      items: [
        { icon: "⚡", text: "Registers", detail: "~1 cycle access, bytes, on-chip" },
        { icon: "🔥", text: "L1 Cache", detail: "~4 cycles, 32-64KB, on-chip" },
        { icon: "💨", text: "L2/L3 Cache", detail: "~10-40 cycles, MB range" },
        { icon: "🏠", text: "Main Memory (RAM)", detail: "~100-300 cycles, GB range" },
        { icon: "💿", text: "Disk/SSD", detail: "~millions of cycles, TB range" }
      ],
      note: "Keep frequently used data close to the processor!"
    },
    interactive: { type: "memory-hierarchy" }
  },

  // REGISTERS
  {
    id: 7,
    section: "memory",
    type: "concept",
    title: "Registers",
    content: {
      description: "The fastest storage, directly on the processor:",
      items: [
        { icon: "🔢", text: "General Purpose", detail: "Hold integers, addresses (e.g., R0-R31)" },
        { icon: "📊", text: "Floating Point", detail: "Hold floating-point values (e.g., F0-F31)" },
        { icon: "📍", text: "Program Counter (PC)", detail: "Address of next instruction" },
        { icon: "🚩", text: "Status Register", detail: "Condition codes, flags (zero, negative, overflow)" },
        { icon: "📚", text: "Stack Pointer (SP)", detail: "Points to top of runtime stack" }
      ],
      note: "RISC machines typically have 32 general-purpose registers"
    }
  },

  // DATA REPRESENTATION
  {
    id: 8,
    section: "data",
    type: "concept",
    title: "Data Representation",
    content: {
      description: "How data is stored in memory:",
      items: [
        { icon: "8️⃣", text: "Byte Addressable", detail: "Each 8-bit byte has unique address" },
        { icon: "🔢", text: "Integers", detail: "16, 32, or 64 bits (2's complement)" },
        { icon: "📊", text: "Floating Point", detail: "32 (float), 64 (double), 128 bits (IEEE 754)" },
        { icon: "📝", text: "Instructions", detail: "Fixed size (32 bits) on RISC, variable on CISC" }
      ]
    }
  },

  // ENDIANNESS
  {
    id: 9,
    section: "data",
    type: "comparison",
    title: "Byte Order: Endianness",
    content: {
      description: "How multi-byte values are stored in memory:",
      approaches: [
        {
          name: "Big-Endian",
          how: "Most significant byte first",
          example: "0x12345678 → 12 34 56 78",
          used: "Network protocols, SPARC, PowerPC"
        },
        {
          name: "Little-Endian",
          how: "Least significant byte first",
          example: "0x12345678 → 78 56 34 12",
          used: "x86, ARM (usually), most modern CPUs"
        }
      ],
      note: "Important when reading binary files or network data!"
    },
    interactive: { type: "endianness" }
  },

  // INSTRUCTION SET OVERVIEW
  {
    id: 10,
    section: "instructions",
    type: "concept",
    title: "Instruction Set Architecture (ISA)",
    content: {
      description: "Categories of machine instructions:",
      items: [
        { icon: "📦", text: "Data Movement", detail: "LOAD, STORE, MOV, PUSH, POP" },
        { icon: "➕", text: "Arithmetic/Logic", detail: "ADD, SUB, MUL, DIV, AND, OR, SHIFT" },
        { icon: "🔀", text: "Control Flow", detail: "JUMP, BRANCH, CALL, RETURN" },
        { icon: "🔍", text: "Comparison", detail: "CMP, TEST (set condition codes)" }
      ]
    }
  },

  // ADDRESSING MODES
  {
    id: 11,
    section: "instructions",
    type: "definition",
    title: "Addressing Modes",
    content: {
      definition: "Ways to specify operand locations:",
      items: [
        { term: "Immediate", definition: "Data is in the instruction itself", example: "ADD R1, #5" },
        { term: "Register", definition: "Data is in a register", example: "ADD R1, R2" },
        { term: "Direct", definition: "Address is in instruction", example: "LOAD R1, [1000]" },
        { term: "Register Indirect", definition: "Address is in a register", example: "LOAD R1, [R2]" },
        { term: "Indexed", definition: "Base + offset", example: "LOAD R1, [R2 + 8]" },
        { term: "Scaled Indexed", definition: "Base + index*scale + offset", example: "LOAD R1, [R2 + R3*4 + 8]" }
      ]
    }
  },

  // RISC VS CISC
  {
    id: 12,
    section: "architecture",
    type: "comparison",
    title: "RISC vs CISC",
    content: {
      approaches: [
        {
          name: "RISC",
          full: "Reduced Instruction Set Computer",
          characteristics: [
            "Simple, fixed-size instructions",
            "Load/store architecture",
            "Many registers",
            "Single-cycle execution goal",
            "Hardware simplicity → speed"
          ],
          examples: "ARM, MIPS, RISC-V, SPARC, PowerPC"
        },
        {
          name: "CISC",
          full: "Complex Instruction Set Computer",
          characteristics: [
            "Variable-length instructions",
            "Memory operands in most instructions",
            "Fewer registers",
            "Complex instructions (multi-cycle)",
            "Compact code"
          ],
          examples: "x86, x86-64, VAX, 68000"
        }
      ]
    },
    interactive: { type: "risc-cisc" }
  },

  // RISC PHILOSOPHY
  {
    id: 13,
    section: "architecture",
    type: "concept",
    title: "RISC Philosophy",
    content: {
      description: "Make the common case fast:",
      items: [
        { icon: "1️⃣", text: "One Instruction Per Cycle", detail: "Simple instructions complete in one clock" },
        { icon: "📏", text: "Fixed Instruction Format", detail: "Easy to decode, predictable pipeline" },
        { icon: "📦", text: "Load/Store Architecture", detail: "Only LOAD/STORE access memory; ALU uses registers" },
        { icon: "📚", text: "Many Registers", detail: "32+ registers reduce memory traffic" },
        { icon: "🔧", text: "Compiler Does the Work", detail: "Complex operations built from simple ones" }
      ]
    }
  },

  // PIPELINING
  {
    id: 14,
    section: "pipeline",
    type: "concept",
    title: "Pipelining",
    content: {
      description: "The most important performance trick - overlap instruction execution:",
      items: [
        { icon: "🏭", text: "Assembly Line", detail: "Like a factory - multiple instructions in flight" },
        { icon: "⏱️", text: "Throughput", detail: "One instruction completes per cycle (ideally)" },
        { icon: "⏳", text: "Latency", detail: "Each instruction still takes multiple cycles" },
        { icon: "📊", text: "Stages", detail: "IF → ID → EX → MEM → WB (classic 5-stage)" }
      ]
    },
    interactive: { type: "pipeline" }
  },

  // PIPELINE STAGES
  {
    id: 15,
    section: "pipeline",
    type: "diagram",
    title: "Classic 5-Stage Pipeline",
    content: {
      stages: [
        { abbrev: "IF", name: "Instruction Fetch", detail: "Read instruction from memory" },
        { abbrev: "ID", name: "Instruction Decode", detail: "Decode opcode, read registers" },
        { abbrev: "EX", name: "Execute", detail: "ALU operation or address calculation" },
        { abbrev: "MEM", name: "Memory Access", detail: "Load/store data (if needed)" },
        { abbrev: "WB", name: "Write Back", detail: "Write result to register" }
      ]
    },
    interactive: { type: "pipeline-stages" }
  },

  // PIPELINE HAZARDS
  {
    id: 16,
    section: "pipeline",
    type: "concept",
    title: "Pipeline Hazards",
    content: {
      description: "Problems that stall the pipeline:",
      items: [
        { icon: "📊", text: "Data Hazard", detail: "Instruction needs result not yet computed" },
        { icon: "🔀", text: "Control Hazard", detail: "Branch - don't know which instruction is next" },
        { icon: "🏗️", text: "Structural Hazard", detail: "Two instructions need same hardware unit" }
      ],
      solutions: [
        { problem: "Data Hazard", solution: "Forwarding, stalling, compiler scheduling" },
        { problem: "Control Hazard", solution: "Branch prediction, delay slots" },
        { problem: "Structural Hazard", solution: "More hardware units" }
      ]
    }
  },

  // INSTRUCTION SCHEDULING
  {
    id: 17,
    section: "compiler",
    type: "concept",
    title: "Instruction Scheduling",
    content: {
      description: "Compiler reorders instructions to avoid pipeline stalls:",
      items: [
        { icon: "📋", text: "Goal", detail: "Minimize stalls by separating dependent instructions" },
        { icon: "🔄", text: "Fill Delay Slots", detail: "Put useful work in load/branch delay slots" },
        { icon: "⚖️", text: "Trade-offs", detail: "May conflict with register allocation" },
        { icon: "🎯", text: "Critical", detail: "One of most important optimizations for RISC" }
      ]
    },
    interactive: { type: "scheduling" }
  },

  // REGISTER ALLOCATION
  {
    id: 18,
    section: "compiler",
    type: "concept",
    title: "Register Allocation",
    content: {
      description: "Keep the right values in registers:",
      items: [
        { icon: "⚡", text: "Why It Matters", detail: "Registers ~100x faster than memory" },
        { icon: "🎯", text: "Goal", detail: "Maximize register usage, minimize spills to memory" },
        { icon: "📊", text: "Graph Coloring", detail: "Classic algorithm - color interference graph with K registers" },
        { icon: "⚔️", text: "Conflicts", detail: "Good scheduling may need more registers" }
      ]
    }
  },

  // SUPERSCALAR
  {
    id: 19,
    section: "modern",
    type: "concept",
    title: "Superscalar Processors",
    content: {
      description: "Execute multiple instructions per cycle:",
      items: [
        { icon: "2️⃣", text: "Multiple Issue", detail: "Start 2, 4, or more instructions per cycle" },
        { icon: "🔀", text: "Out-of-Order", detail: "Execute instructions as operands become ready" },
        { icon: "🔮", text: "Speculation", detail: "Predict branches, execute speculatively" },
        { icon: "📋", text: "Reorder Buffer", detail: "Retire instructions in original order" }
      ],
      note: "Modern x86 chips are internally RISC-like superscalar machines!"
    }
  },

  // MODERN PROCESSOR FEATURES
  {
    id: 20,
    section: "modern",
    type: "concept",
    title: "Modern Processor Features",
    content: {
      description: "What you find in today's CPUs:",
      items: [
        { icon: "🔮", text: "Branch Prediction", detail: "Guess branch outcome, ~95%+ accuracy" },
        { icon: "📦", text: "Large Caches", detail: "Multi-level, multi-MB on-chip caches" },
        { icon: "🧮", text: "SIMD Units", detail: "Vector operations (SSE, AVX, NEON)" },
        { icon: "🔢", text: "Multiple Cores", detail: "2-64+ independent processors on one chip" },
        { icon: "🔄", text: "Hyperthreading", detail: "Multiple threads share one core's resources" }
      ]
    }
  },

  // MAJOR ARCHITECTURES
  {
    id: 21,
    section: "architectures",
    type: "table",
    title: "Major Architectures Today",
    content: {
      headers: ["Architecture", "Type", "Used In"],
      rows: [
        ["x86-64", "CISC", "Desktop, laptop, server (Intel, AMD)"],
        ["ARM", "RISC", "Smartphones, tablets, Apple M-series, servers"],
        ["RISC-V", "RISC", "Open source, embedded, growing adoption"],
        ["MIPS", "RISC", "Embedded, networking, education"],
        ["PowerPC", "RISC", "Game consoles, embedded"],
        ["SPARC", "RISC", "Oracle servers (legacy)"]
      ]
    }
  },

  // IMPLICATIONS FOR COMPILERS
  {
    id: 22,
    section: "implications",
    type: "concept",
    title: "Implications for Compiler Writers",
    content: {
      description: "What modern architectures mean for compilation:",
      items: [
        { icon: "📋", text: "Instruction Scheduling", detail: "Reorder to avoid stalls, fill delay slots" },
        { icon: "📦", text: "Register Allocation", detail: "Use all registers effectively" },
        { icon: "🎯", text: "Cache Awareness", detail: "Data layout for cache efficiency" },
        { icon: "🔀", text: "Branch Optimization", detail: "Layout code to help prediction" },
        { icon: "🧮", text: "Vectorization", detail: "Use SIMD instructions when possible" }
      ],
      note: "Good compilers must understand the target machine deeply"
    }
  },

  // SUMMARY
  {
    id: 23,
    section: "summary",
    type: "summary",
    title: "Chapter 5 Summary",
    content: {
      sections: [
        {
          title: "Architecture Basics",
          points: [
            "Von Neumann: stored program, fetch-execute",
            "Memory hierarchy: registers → cache → RAM",
            "Registers are fastest, most precious resource"
          ]
        },
        {
          title: "RISC vs CISC",
          points: [
            "RISC: simple, regular, load/store, many registers",
            "CISC: complex, variable, memory operands",
            "Modern x86 is internally RISC-like"
          ]
        },
        {
          title: "Pipelining & Modern CPUs",
          points: [
            "Pipeline overlaps instruction execution",
            "Hazards: data, control, structural",
            "Superscalar: multiple instructions per cycle"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Fetch-Execute Cycle Visualization
const FetchExecuteCycle = () => {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  const steps = [
    { stage: "Fetch", desc: "Read instruction from memory at PC address", pc: "0x1000", ir: "LOAD R1, [100]" },
    { stage: "Decode", desc: "Decode opcode: this is a LOAD instruction", pc: "0x1000", ir: "LOAD R1, [100]" },
    { stage: "Fetch Operands", desc: "Calculate effective address: 100", pc: "0x1000", ir: "LOAD R1, [100]" },
    { stage: "Execute", desc: "Read value 42 from memory address 100", pc: "0x1000", ir: "LOAD R1, [100]" },
    { stage: "Store Result", desc: "Write 42 to register R1", pc: "0x1000", ir: "LOAD R1, [100]" },
    { stage: "Update PC", desc: "Increment PC to point to next instruction", pc: "0x1004", ir: "LOAD R1, [100]" }
  ];

  useEffect(() => {
    if (auto) {
      const timer = setInterval(() => {
        setStep(s => (s + 1) % steps.length);
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [auto]);

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-amber-400 text-lg mb-4 font-mono">Interactive: Fetch-Execute Cycle</div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Program Counter</div>
          <div className="text-2xl font-mono text-amber-400">{current.pc}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Instruction Register</div>
          <div className="text-xl font-mono text-green-400">{current.ir}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Current Stage</div>
          <div className="text-2xl font-bold text-white">{current.stage}</div>
        </div>
      </div>

      <div className="bg-amber-500/20 border border-amber-500 p-5 rounded-lg mb-6">
        <div className="text-amber-400 text-xl">{current.desc}</div>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-3 h-3 rounded-full ${i === step ? 'bg-amber-500' : 'bg-slate-600'}`}
          />
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} 
          className="px-5 py-2 bg-slate-700 rounded text-lg">← Prev</button>
        <button onClick={() => setAuto(!auto)} 
          className={`px-5 py-2 rounded text-lg ${auto ? 'bg-red-500' : 'bg-green-600'}`}>
          {auto ? '⏹ Stop' : '▶ Auto'}
        </button>
        <button onClick={() => setStep(s => (s + 1) % steps.length)} 
          className="px-5 py-2 bg-slate-700 rounded text-lg">Next →</button>
      </div>
    </div>
  );
};

// Memory Hierarchy Demo
const MemoryHierarchyDemo = () => {
  const [selected, setSelected] = useState(null);

  const levels = [
    { name: "Registers", size: "~256 bytes", speed: "1 cycle", color: "red" },
    { name: "L1 Cache", size: "32-64 KB", speed: "~4 cycles", color: "orange" },
    { name: "L2 Cache", size: "256 KB - 1 MB", speed: "~10 cycles", color: "yellow" },
    { name: "L3 Cache", size: "4-64 MB", speed: "~40 cycles", color: "green" },
    { name: "Main Memory", size: "8-128 GB", speed: "~200 cycles", color: "blue" },
    { name: "SSD/Disk", size: "256 GB - 4 TB", speed: "~100,000+ cycles", color: "purple" }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-amber-400 text-lg mb-4 font-mono">Interactive: Memory Hierarchy</div>
      
      <div className="flex flex-col items-center gap-2">
        {levels.map((level, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`transition-all rounded-lg p-3 text-center ${
              selected === i ? 'ring-4 ring-amber-500' : ''
            }`}
            style={{
              width: `${100 + i * 50}px`,
              background: `linear-gradient(135deg, ${
                level.color === 'red' ? '#ef4444' :
                level.color === 'orange' ? '#f97316' :
                level.color === 'yellow' ? '#eab308' :
                level.color === 'green' ? '#22c55e' :
                level.color === 'blue' ? '#3b82f6' :
                '#a855f7'
              }40, ${
                level.color === 'red' ? '#ef4444' :
                level.color === 'orange' ? '#f97316' :
                level.color === 'yellow' ? '#eab308' :
                level.color === 'green' ? '#22c55e' :
                level.color === 'blue' ? '#3b82f6' :
                '#a855f7'
              }20)`
            }}
          >
            <div className="text-white font-bold text-lg">{level.name}</div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="mt-6 bg-slate-900 p-5 rounded-lg">
          <div className="text-2xl font-bold text-white mb-3">{levels[selected].name}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-base">Typical Size</div>
              <div className="text-xl text-amber-400">{levels[selected].size}</div>
            </div>
            <div>
              <div className="text-slate-400 text-base">Access Time</div>
              <div className="text-xl text-green-400">{levels[selected].speed}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-slate-400 text-lg">
        Click a level to see details. Faster ↑ | Bigger ↓
      </div>
    </div>
  );
};

// Endianness Demo
const EndiannessDemo = () => {
  const [value, setValue] = useState(0x12345678);

  const hexBytes = value.toString(16).padStart(8, '0').match(/.{2}/g) || [];
  const bigEndian = hexBytes;
  const littleEndian = [...hexBytes].reverse();

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-amber-400 text-lg mb-4 font-mono">Interactive: Byte Order (Endianness)</div>
      
      <div className="text-center mb-6">
        <div className="text-slate-400 text-lg mb-2">32-bit Value</div>
        <div className="text-4xl font-mono text-white">0x{value.toString(16).toUpperCase().padStart(8, '0')}</div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 p-5 rounded-lg">
          <div className="text-blue-400 font-bold text-xl mb-3">Big-Endian</div>
          <div className="flex gap-2 justify-center">
            {bigEndian.map((b, i) => (
              <div key={i} className="w-16 h-16 bg-blue-500/30 rounded flex items-center justify-center">
                <span className="font-mono text-xl text-white">{b.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="text-slate-400 text-base mt-3 text-center">MSB first (address 0 → 3)</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-lg">
          <div className="text-orange-400 font-bold text-xl mb-3">Little-Endian</div>
          <div className="flex gap-2 justify-center">
            {littleEndian.map((b, i) => (
              <div key={i} className="w-16 h-16 bg-orange-500/30 rounded flex items-center justify-center">
                <span className="font-mono text-xl text-white">{b.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="text-slate-400 text-base mt-3 text-center">LSB first (address 0 → 3)</div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => setValue(0x12345678)} className="px-4 py-2 bg-slate-700 rounded text-lg">0x12345678</button>
        <button onClick={() => setValue(0xDEADBEEF)} className="px-4 py-2 bg-slate-700 rounded text-lg">0xDEADBEEF</button>
        <button onClick={() => setValue(0xCAFEBABE)} className="px-4 py-2 bg-slate-700 rounded text-lg">0xCAFEBABE</button>
      </div>
    </div>
  );
};

// RISC vs CISC Demo
const RiscCiscDemo = () => {
  const [arch, setArch] = useState('risc');

  const examples = {
    risc: {
      name: "RISC (ARM)",
      code: `; Add memory values, store result
LOAD  R1, [R10]      ; Load first value
LOAD  R2, [R10, #4]  ; Load second value  
ADD   R3, R1, R2     ; Add them
STORE R3, [R10, #8]  ; Store result`,
      instructions: 4,
      cycles: "4-6 cycles",
      note: "Load/store architecture: only LOAD/STORE access memory"
    },
    cisc: {
      name: "CISC (x86)",
      code: `; Add memory values, store result
MOV  EAX, [EBX]      ; Load first value
ADD  EAX, [EBX+4]    ; Add from memory
MOV  [EBX+8], EAX    ; Store result`,
      instructions: 3,
      cycles: "3-10+ cycles",
      note: "Memory operands allowed in arithmetic instructions"
    }
  };

  const current = examples[arch];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-amber-400 text-lg mb-4 font-mono">Interactive: RISC vs CISC Code</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setArch('risc')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${arch === 'risc' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          RISC
        </button>
        <button onClick={() => setArch('cisc')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${arch === 'cisc' ? 'bg-orange-500 text-white' : 'bg-slate-700'}`}>
          CISC
        </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-lg mb-6">
        <div className={`font-bold text-xl mb-3 ${arch === 'risc' ? 'text-blue-400' : 'text-orange-400'}`}>
          {current.name}
        </div>
        <pre className="text-green-400 font-mono text-lg">{current.code}</pre>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Instructions</div>
          <div className="text-3xl font-bold text-white">{current.instructions}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg text-center">
          <div className="text-slate-400 text-base">Typical Cycles</div>
          <div className="text-2xl font-bold text-amber-400">{current.cycles}</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${arch === 'risc' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
        <div className={arch === 'risc' ? 'text-blue-400' : 'text-orange-400'}>
          {current.note}
        </div>
      </div>
    </div>
  );
};

// Pipeline Visualization
const PipelineDemo = () => {
  const [cycle, setCycle] = useState(0);
  
  const instructions = ['I1: LOAD', 'I2: ADD', 'I3: SUB', 'I4: STORE', 'I5: MUL'];
  const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'];

  const getInstructionAtStage = (cycleNum, stageIdx) => {
    const instrIdx = cycleNum - stageIdx;
    if (instrIdx >= 0 && instrIdx < instructions.length) {
      return instructions[instrIdx];
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-amber-400 text-lg mb-4 font-mono">Interactive: 5-Stage Pipeline</div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left text-slate-400 text-lg">Stage</th>
              {[...Array(9)].map((_, i) => (
                <th key={i} className={`p-3 text-center text-lg ${i === cycle ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  C{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, stageIdx) => (
              <tr key={stage}>
                <td className="p-3 font-bold text-white text-lg">{stage}</td>
                {[...Array(9)].map((_, cycleIdx) => {
                  const instr = getInstructionAtStage(cycleIdx, stageIdx);
                  const isCurrent = cycleIdx === cycle && instr;
                  return (
                    <td key={cycleIdx} className="p-2">
                      {instr && (
                        <div className={`px-2 py-1 rounded text-center text-sm font-mono ${
                          isCurrent ? 'bg-amber-500 text-white' : 
                          instr.includes('LOAD') ? 'bg-blue-500/30 text-blue-300' :
                          instr.includes('STORE') ? 'bg-purple-500/30 text-purple-300' :
                          'bg-green-500/30 text-green-300'
                        }`}>
                          {instr.split(':')[0]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <button onClick={() => setCycle(c => Math.max(0, c - 1))} 
          className="px-5 py-2 bg-slate-700 rounded text-lg">← Prev</button>
        <span className="px-5 py-2 bg-amber-500/20 rounded text-amber-400 text-lg">Cycle {cycle + 1}</span>
        <button onClick={() => setCycle(c => Math.min(8, c + 1))} 
          className="px-5 py-2 bg-slate-700 rounded text-lg">Next →</button>
        <button onClick={() => setCycle(0)} 
          className="px-5 py-2 bg-amber-600 rounded text-lg">Reset</button>
      </div>

      <div className="mt-4 text-center text-slate-400 text-lg">
        At cycle {cycle + 1}: {instructions.filter((_, i) => i <= cycle && i > cycle - 5).length} instructions in flight
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🖥️</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-amber-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-6 text-amber-400 italic text-xl">{slide.content.note}</p>}
    {slide.content.solutions && (
      <div className="mt-6 space-y-3">
        {slide.content.solutions.map((s, i) => (
          <div key={i} className="bg-green-500/20 p-4 rounded-lg">
            <span className="text-green-400 font-bold">{s.problem}:</span>
            <span className="text-slate-300 ml-2">{s.solution}</span>
          </div>
        ))}
      </div>
    )}
    {slide.interactive?.type === 'fetch-execute' && <FetchExecuteCycle />}
    {slide.interactive?.type === 'memory-hierarchy' && <MemoryHierarchyDemo />}
    {slide.interactive?.type === 'pipeline' && <PipelineDemo />}
  </div>
);

const DiagramSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-3xl text-slate-300 mb-8">{slide.content.description}</p>}
    {slide.content.steps && (
      <div className="space-y-4">
        {slide.content.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-4 bg-slate-800/50 p-5 rounded-xl">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {i + 1}
            </div>
            <div>
              <div className="text-white font-bold text-xl">{step.name}</div>
              <div className="text-slate-300 text-lg">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    )}
    {slide.content.stages && (
      <div className="flex gap-3 justify-center flex-wrap">
        {slide.content.stages.map((stage, i) => (
          <div key={i} className="bg-slate-800/50 p-5 rounded-xl text-center w-36">
            <div className="text-amber-400 font-bold text-2xl">{stage.abbrev}</div>
            <div className="text-white text-lg mt-2">{stage.name}</div>
            <div className="text-slate-400 text-base mt-1">{stage.detail}</div>
          </div>
        ))}
      </div>
    )}
    {slide.interactive?.type === 'fetch-execute-cycle' && <FetchExecuteCycle />}
    {slide.interactive?.type === 'pipeline-stages' && <PipelineDemo />}
  </div>
);

const DefinitionSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.definition && <p className="text-3xl text-slate-300 mb-8">{slide.content.definition}</p>}
    <div className="space-y-5">
      {slide.content.items?.map((item, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl border-l-4 border-amber-500">
          <div className="flex items-start gap-4">
            <span className="text-amber-400 font-bold text-2xl min-w-fit">{item.term}</span>
            <div className="flex-1">
              <p className="text-white text-xl">{item.definition}</p>
              {item.example && <p className="text-slate-400 font-mono text-lg mt-3">Example: {item.example}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-orange-500 bg-orange-500/10'}`}>
          <h3 className={`font-bold text-3xl mb-2 ${i === 0 ? 'text-blue-400' : 'text-orange-400'}`}>{a.name}</h3>
          {a.full && <p className="text-slate-400 text-lg mb-3">{a.full}</p>}
          {a.how && <p className="text-white text-xl mb-3">{a.how}</p>}
          {a.example && <p className="text-slate-400 font-mono text-lg mb-3">{a.example}</p>}
          {a.used && <p className="text-slate-500 text-base">Used by: {a.used}</p>}
          {a.characteristics && (
            <ul className="space-y-2 mt-3">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-lg">• {c}</li>
              ))}
            </ul>
          )}
          {a.examples && <p className="text-slate-500 text-base mt-3">Examples: {a.examples}</p>}
        </div>
      ))}
    </div>
    {slide.content.note && <p className="mt-6 text-amber-400 text-xl italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'endianness' && <EndiannessDemo />}
    {slide.interactive?.type === 'risc-cisc' && <RiscCiscDemo />}
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
              <th key={i} className="text-left p-4 text-amber-400 font-bold text-2xl">{h}</th>
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
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-amber-400 font-bold text-2xl mb-5">{section.title}</h3>
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
    case 'diagram': return <DiagramSlide slide={slide} />;
    case 'definition': return <DefinitionSlide slide={slide} />;
    case 'comparison': return <ComparisonSlide slide={slide} />;
    case 'table': return <TableSlide slide={slide} />;
    case 'summary': return <SummarySlide slide={slide} />;
    default: return <ConceptSlide slide={slide} />;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function Chapter5Slides({ onBackToChapters }) {
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
            <span className="text-amber-400 font-bold text-lg">Ch 5: {CHAPTER_CONFIG.title}</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 5 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-amber-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-amber-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 rounded text-lg disabled:opacity-30">
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

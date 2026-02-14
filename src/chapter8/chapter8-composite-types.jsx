import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 8: COMPOSITE TYPES
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 8,
  title: "Composite Types",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#14b8a6" // teal
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
    title: "Chapter 8: Composite Types",
    content: {
      subtitle: "Building Complex Data Structures",
      topics: [
        "Records/Structs",
        "Arrays",
        "Strings",
        "Unions/Variants",
        "Pointers",
        "Lists",
        "Memory Layout"
      ]
    }
  },

  // OVERVIEW
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Composite Type Overview",
    content: {
      description: "Types built from other types:",
      items: [
        { icon: "📦", text: "Records (Structs)", detail: "Collection of named fields of different types" },
        { icon: "📚", text: "Arrays", detail: "Indexed collection of same-type elements" },
        { icon: "🔗", text: "Unions/Variants", detail: "One of several types sharing memory" },
        { icon: "👆", text: "Pointers", detail: "References to memory locations" },
        { icon: "📝", text: "Strings", detail: "Sequences of characters" },
        { icon: "🔄", text: "Lists", detail: "Recursive linked structures" }
      ]
    }
  },

  // RECORDS/STRUCTS
  {
    id: 3,
    section: "records",
    type: "concept",
    title: "Records (Structs)",
    content: {
      description: "Named collection of fields with potentially different types:",
      items: [
        { icon: "🏷️", text: "Named Fields", detail: "Access by name: person.age, person.name" },
        { icon: "📊", text: "Heterogeneous", detail: "Fields can have different types" },
        { icon: "💾", text: "Contiguous", detail: "Usually laid out contiguously in memory" },
        { icon: "⚠️", text: "Alignment", detail: "May have holes for alignment requirements" }
      ],
      code: `struct Person {
    char name[20];   // 20 bytes
    int age;         // 4 bytes
    double salary;   // 8 bytes
};`
    }
  },

  // MEMORY LAYOUT
  {
    id: 4,
    section: "records",
    type: "concept",
    title: "Record Memory Layout",
    content: {
      description: "Alignment requirements can create holes in memory:",
      items: [
        { icon: "📏", text: "Alignment", detail: "Types often must start at addresses divisible by their size" },
        { icon: "🕳️", text: "Padding/Holes", detail: "Unused bytes inserted for alignment" },
        { icon: "🔀", text: "Reordering", detail: "Some compilers reorder fields to minimize holes" },
        { icon: "📦", text: "Packing", detail: "Can force no padding (slower access)" }
      ]
    },
    interactive: { type: "struct-layout" }
  },

  // UNIONS
  {
    id: 5,
    section: "records",
    type: "concept",
    title: "Unions (Variant Records)",
    content: {
      description: "Multiple interpretations of the same memory:",
      items: [
        { icon: "🔄", text: "Overlay", detail: "All fields share the same memory location" },
        { icon: "📐", text: "Size", detail: "Size = largest member (all fit in same space)" },
        { icon: "⚠️", text: "Type Safety", detail: "Dangerous - no checking which type is actually stored" },
        { icon: "🏷️", text: "Tagged Unions", detail: "Modern safe alternative (Rust enum, Swift enum)" }
      ],
      code: `union Data {
    int i;      // 4 bytes
    float f;    // 4 bytes  
    char c;     // 1 byte
};  // Total size: 4 bytes (largest)`
    },
    interactive: { type: "union" }
  },

  // ARRAYS
  {
    id: 6,
    section: "arrays",
    type: "concept",
    title: "Arrays",
    content: {
      description: "The most common composite type - indexed collection:",
      items: [
        { icon: "📊", text: "Homogeneous", detail: "All elements have the same type" },
        { icon: "🔢", text: "Indexed", detail: "Access by integer index: a[0], a[1], ..." },
        { icon: "📐", text: "Contiguous", detail: "Elements stored contiguously in memory" },
        { icon: "⚡", text: "Fast Access", detail: "O(1) random access via address calculation" }
      ]
    }
  },

  // ARRAY DIMENSIONS
  {
    id: 7,
    section: "arrays",
    type: "concept",
    title: "Array Bounds and Allocation",
    content: {
      description: "When are array bounds determined?",
      items: [
        { icon: "🔒", text: "Static", detail: "Bounds known at compile time (C arrays)" },
        { icon: "🏗️", text: "Elaboration Time", detail: "Bounds set when scope is entered (VLAs in C99)" },
        { icon: "🔄", text: "Dynamic", detail: "Can resize at any time (Python lists, Java ArrayList)" }
      ],
      code: `// Static (C)
int arr[100];

// Elaboration time (C99 VLA)
void f(int n) {
    int arr[n];  // Size determined at runtime
}`
    }
  },

  // ROW VS COLUMN MAJOR
  {
    id: 8,
    section: "arrays",
    type: "comparison",
    title: "Row-Major vs Column-Major",
    content: {
      description: "How are multi-dimensional arrays stored?",
      approaches: [
        {
          name: "Row-Major",
          how: "Elements of each ROW are contiguous",
          used: "C, C++, Java, Python (and most languages)",
          example: "A[0][0], A[0][1], A[0][2], A[1][0], ..."
        },
        {
          name: "Column-Major",
          how: "Elements of each COLUMN are contiguous",
          used: "Fortran, MATLAB, R",
          example: "A[0][0], A[1][0], A[2][0], A[0][1], ..."
        }
      ],
      note: "Important for cache performance - access in storage order!"
    },
    interactive: { type: "row-column-major" }
  },

  // ARRAY ADDRESS CALCULATION
  {
    id: 9,
    section: "arrays",
    type: "concept",
    title: "Array Address Calculation",
    content: {
      description: "How to find element A[i][j] in memory:",
      items: [
        { icon: "📍", text: "Base Address", detail: "Starting address of array" },
        { icon: "📐", text: "Element Size", detail: "Size of each element in bytes" },
        { icon: "🧮", text: "Formula", detail: "addr = base + (i * cols + j) * size (row-major)" }
      ],
      code: `// For A[rows][cols] in row-major:
address(A[i][j]) = 
    base_address + 
    (i * num_cols + j) * element_size`
    },
    interactive: { type: "array-address" }
  },

  // ARRAY SLICES
  {
    id: 10,
    section: "arrays",
    type: "concept",
    title: "Array Slices",
    content: {
      description: "Selecting portions of arrays:",
      items: [
        { icon: "✂️", text: "Slice", detail: "Rectangular portion of an array" },
        { icon: "🐍", text: "Python", detail: "a[1:5], a[::2], a[::-1]" },
        { icon: "📊", text: "Fortran 90", detail: "A(1:10:2) = elements 1,3,5,7,9" },
        { icon: "📋", text: "NumPy", detail: "Advanced slicing and indexing" }
      ],
      code: `# Python slices
a = [0, 1, 2, 3, 4, 5]
a[1:4]    # [1, 2, 3]
a[::2]    # [0, 2, 4]
a[::-1]   # [5, 4, 3, 2, 1, 0]`
    }
  },

  // ROW POINTERS VS CONTIGUOUS
  {
    id: 11,
    section: "arrays",
    type: "comparison",
    title: "Contiguous vs Row Pointers",
    content: {
      approaches: [
        {
          name: "Contiguous Allocation",
          characteristics: [
            "All elements in one block",
            "Requires multiplication for indexing",
            "Better cache locality",
            "Fixed row sizes"
          ]
        },
        {
          name: "Row Pointers (Iliffe vectors)",
          characteristics: [
            "Array of pointers to rows",
            "No multiplication needed",
            "Rows can be different sizes (ragged)",
            "Extra pointer storage"
          ]
        }
      ]
    },
    interactive: { type: "array-layout" }
  },

  // STRINGS
  {
    id: 12,
    section: "strings",
    type: "concept",
    title: "Strings",
    content: {
      description: "Sequences of characters - often special-cased:",
      items: [
        { icon: "📝", text: "Character Arrays", detail: "C-style: char str[] with null terminator" },
        { icon: "📦", text: "String Objects", detail: "Length + data (Pascal, Java, Python)" },
        { icon: "🔄", text: "Immutable", detail: "Java, Python strings can't be modified" },
        { icon: "📐", text: "Dynamic", detail: "Can grow/shrink (unlike fixed arrays)" }
      ]
    },
    interactive: { type: "string-rep" }
  },

  // POINTERS
  {
    id: 13,
    section: "pointers",
    type: "concept",
    title: "Pointers",
    content: {
      description: "Variables that hold memory addresses:",
      items: [
        { icon: "👆", text: "Address", detail: "Points to location in memory" },
        { icon: "*", text: "Dereference", detail: "Follow pointer to get value: *p" },
        { icon: "&", text: "Address-of", detail: "Get address of variable: &x" },
        { icon: "🔗", text: "Recursive Types", detail: "Enable linked structures (lists, trees)" }
      ],
      code: `int x = 42;
int *p = &x;    // p points to x
*p = 100;       // x is now 100`
    }
  },

  // POINTER DANGERS
  {
    id: 14,
    section: "pointers",
    type: "concept",
    title: "Pointer Dangers",
    content: {
      description: "What can go wrong with pointers:",
      items: [
        { icon: "💀", text: "Dangling Pointer", detail: "Points to freed/invalid memory" },
        { icon: "🚫", text: "Null Pointer", detail: "Dereferencing null = crash" },
        { icon: "🔓", text: "Memory Leak", detail: "Allocated memory never freed" },
        { icon: "🏃", text: "Buffer Overflow", detail: "Writing past array bounds" }
      ]
    },
    interactive: { type: "pointer-dangers" }
  },

  // DANGLING POINTER SOLUTIONS
  {
    id: 15,
    section: "pointers",
    type: "concept",
    title: "Preventing Dangling Pointers",
    content: {
      description: "Techniques to catch invalid pointer use:",
      items: [
        { icon: "🪦", text: "Tombstones", detail: "Extra indirection; mark tombstone invalid on free" },
        { icon: "🔐", text: "Locks and Keys", detail: "Pointer has key; memory has lock; must match" },
        { icon: "🤖", text: "Garbage Collection", detail: "Never explicitly free; collector reclaims unused" },
        { icon: "👤", text: "Ownership (Rust)", detail: "Type system tracks who owns memory" }
      ]
    }
  },

  // GARBAGE COLLECTION
  {
    id: 16,
    section: "pointers",
    type: "concept",
    title: "Garbage Collection",
    content: {
      description: "Automatic memory reclamation:",
      items: [
        { icon: "🔢", text: "Reference Counting", detail: "Track count of pointers to each object" },
        { icon: "🧹", text: "Mark and Sweep", detail: "Mark reachable objects, sweep unmarked" },
        { icon: "📋", text: "Copying", detail: "Copy live objects to new space" },
        { icon: "👶", text: "Generational", detail: "Separate young and old objects" }
      ]
    },
    interactive: { type: "garbage-collection" }
  },

  // REFERENCE COUNTING
  {
    id: 17,
    section: "pointers",
    type: "concept",
    title: "Reference Counting",
    content: {
      description: "Simple GC: count pointers to each object",
      items: [
        { icon: "➕", text: "Increment", detail: "When pointer assigned to object" },
        { icon: "➖", text: "Decrement", detail: "When pointer leaves scope or reassigned" },
        { icon: "🗑️", text: "Free", detail: "When count reaches zero" },
        { icon: "⚠️", text: "Problem", detail: "Cannot collect circular references!" }
      ]
    },
    interactive: { type: "ref-counting" }
  },

  // LISTS
  {
    id: 18,
    section: "lists",
    type: "concept",
    title: "Lists",
    content: {
      description: "Recursive data structure fundamental to functional programming:",
      items: [
        { icon: "📝", text: "Definition", detail: "Empty list OR (head, tail) where tail is a list" },
        { icon: "🔗", text: "Linked", detail: "Each node points to next element" },
        { icon: "🔄", text: "Recursive", detail: "Natural for recursive algorithms" },
        { icon: "💡", text: "Lisp", detail: "Programs are lists! (Code as data)" }
      ],
      code: `-- Haskell list
data List a = Empty | Cons a (List a)

-- [1, 2, 3] = Cons 1 (Cons 2 (Cons 3 Empty))`
    }
  },

  // SUMMARY
  {
    id: 19,
    section: "summary",
    type: "summary",
    title: "Chapter 8 Summary",
    content: {
      sections: [
        {
          title: "Records & Arrays",
          points: [
            "Records: named heterogeneous fields",
            "Arrays: indexed homogeneous elements",
            "Memory layout affects performance",
            "Row-major vs column-major order"
          ]
        },
        {
          title: "Pointers",
          points: [
            "Hold memory addresses",
            "Enable dynamic structures",
            "Dangling pointers are dangerous",
            "Solutions: GC, ownership, tombstones"
          ]
        },
        {
          title: "Memory Management",
          points: [
            "Reference counting (circular problem)",
            "Mark and sweep",
            "Modern: ownership types (Rust)"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Struct Layout Demo
const StructLayoutDemo = () => {
  const [packed, setPacked] = useState(false);

  const normalLayout = [
    { field: 'char c', size: 1, offset: 0, color: 'blue' },
    { field: '(padding)', size: 3, offset: 1, color: 'gray' },
    { field: 'int i', size: 4, offset: 4, color: 'green' },
    { field: 'char d', size: 1, offset: 8, color: 'purple' },
    { field: '(padding)', size: 7, offset: 9, color: 'gray' },
    { field: 'double x', size: 8, offset: 16, color: 'orange' }
  ];

  const packedLayout = [
    { field: 'char c', size: 1, offset: 0, color: 'blue' },
    { field: 'int i', size: 4, offset: 1, color: 'green' },
    { field: 'char d', size: 1, offset: 5, color: 'purple' },
    { field: 'double x', size: 8, offset: 6, color: 'orange' }
  ];

  const layout = packed ? packedLayout : normalLayout;
  const totalSize = packed ? 14 : 24;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: Struct Memory Layout</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg">
        <span className="text-gray-500">{packed ? '#pragma pack(1)\n' : ''}</span>
        <span className="text-teal-400">struct</span> Example {'{'}<br/>
        <span className="ml-4 text-blue-400">char</span> c;<br/>
        <span className="ml-4 text-green-400">int</span> i;<br/>
        <span className="ml-4 text-purple-400">char</span> d;<br/>
        <span className="ml-4 text-orange-400">double</span> x;<br/>
        {'}'};
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={packed} onChange={(e) => setPacked(e.target.checked)}
            className="w-5 h-5" />
          <span className="text-white text-lg">Packed (no alignment padding)</span>
        </label>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-base mb-2">Memory Layout (each block = 1 byte)</div>
        <div className="flex flex-wrap gap-1">
          {layout.map((item, i) => (
            Array(item.size).fill(0).map((_, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${
                  item.color === 'gray' ? 'bg-slate-600 text-slate-400' :
                  item.color === 'blue' ? 'bg-blue-500' :
                  item.color === 'green' ? 'bg-green-500' :
                  item.color === 'purple' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}
                title={item.field}
              >
                {item.offset + j}
              </div>
            ))
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Total Size</div>
          <div className="text-3xl font-bold text-teal-400">{totalSize} bytes</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base">Wasted (padding)</div>
          <div className="text-3xl font-bold text-red-400">{packed ? 0 : 10} bytes</div>
        </div>
      </div>
    </div>
  );
};

// Union Demo
const UnionDemo = () => {
  const [interpretation, setInterpretation] = useState('int');
  const [intValue, setIntValue] = useState(1078523331);

  const floatView = new Float32Array(new Int32Array([intValue]).buffer)[0];
  const bytes = [
    (intValue) & 0xFF,
    (intValue >> 8) & 0xFF,
    (intValue >> 16) & 0xFF,
    (intValue >> 24) & 0xFF
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: Union Memory Overlay</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg">
        <span className="text-teal-400">union</span> Data {'{'}<br/>
        <span className="ml-4 text-blue-400">int</span> i;<br/>
        <span className="ml-4 text-green-400">float</span> f;<br/>
        <span className="ml-4 text-purple-400">char</span> c[4];<br/>
        {'}'};
      </div>

      <div className="mb-4">
        <label className="text-slate-400 text-lg block mb-2">Set integer value: {intValue}</label>
        <input
          type="range"
          min="0"
          max="2000000000"
          value={intValue}
          onChange={(e) => setIntValue(parseInt(e.target.value))}
          className="w-full h-3 rounded-lg bg-slate-700"
        />
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        {['int', 'float', 'char[]'].map(t => (
          <button
            key={t}
            onClick={() => setInterpretation(t)}
            className={`px-4 py-2 rounded-lg text-lg ${interpretation === t ? 'bg-teal-500 text-white' : 'bg-slate-700'}`}
          >
            View as {t}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-base mb-2">Same 4 bytes in memory:</div>
        <div className="flex gap-2 justify-center mb-4">
          {bytes.map((b, i) => (
            <div key={i} className="w-16 h-16 bg-teal-500/30 rounded flex items-center justify-center">
              <span className="font-mono text-xl text-white">0x{b.toString(16).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-5 rounded-lg ${
        interpretation === 'int' ? 'bg-blue-500/20 border border-blue-500' :
        interpretation === 'float' ? 'bg-green-500/20 border border-green-500' :
        'bg-purple-500/20 border border-purple-500'
      }`}>
        <div className={`text-2xl font-mono ${
          interpretation === 'int' ? 'text-blue-400' :
          interpretation === 'float' ? 'text-green-400' : 'text-purple-400'
        }`}>
          {interpretation === 'int' && `int: ${intValue}`}
          {interpretation === 'float' && `float: ${floatView.toFixed(6)}`}
          {interpretation === 'char[]' && `chars: [${bytes.map(b => 
            b >= 32 && b < 127 ? `'${String.fromCharCode(b)}'` : b
          ).join(', ')}]`}
        </div>
      </div>

      <div className="mt-4 bg-amber-500/20 p-4 rounded-lg">
        <div className="text-amber-400 text-lg">⚠️ Same bytes, different interpretations! Type safety lost.</div>
      </div>
    </div>
  );
};

// Row vs Column Major Demo
const RowColumnMajorDemo = () => {
  const [order, setOrder] = useState('row');
  
  const matrix = [
    ['A[0,0]', 'A[0,1]', 'A[0,2]'],
    ['A[1,0]', 'A[1,1]', 'A[1,2]'],
    ['A[2,0]', 'A[2,1]', 'A[2,2]']
  ];

  const rowMajor = matrix.flat();
  const colMajor = [0, 1, 2].flatMap(c => matrix.map(row => row[c]));

  const memoryOrder = order === 'row' ? rowMajor : colMajor;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: Row-Major vs Column-Major</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setOrder('row')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${order === 'row' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Row-Major (C)
        </button>
        <button onClick={() => setOrder('col')}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${order === 'col' ? 'bg-green-500 text-white' : 'bg-slate-700'}`}>
          Column-Major (Fortran)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-slate-400 text-lg mb-2">2D Array (logical view)</div>
          <div className="bg-slate-900 p-4 rounded-lg">
            {matrix.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                {row.map((cell, j) => (
                  <div key={j} className={`w-20 h-12 rounded flex items-center justify-center text-sm font-mono ${
                    (order === 'row' && i === 0) || (order === 'col' && j === 0) 
                      ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-lg mb-2">Memory (linear view)</div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {memoryOrder.map((cell, i) => (
                <div key={i} className={`w-20 h-10 rounded flex items-center justify-center text-sm font-mono ${
                  i < 3 ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {cell}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-4 p-4 rounded-lg ${order === 'row' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
        <div className={order === 'row' ? 'text-blue-400' : 'text-green-400'}>
          {order === 'row' 
            ? 'Row-major: Iterate over rows for best cache performance → for(i) for(j) A[i][j]'
            : 'Column-major: Iterate over columns for best cache performance → for(j) for(i) A[i][j]'}
        </div>
      </div>
    </div>
  );
};

// Array Address Calculation
const ArrayAddressDemo = () => {
  const [i, setI] = useState(1);
  const [j, setJ] = useState(2);
  const baseAddr = 1000;
  const rows = 3;
  const cols = 4;
  const elemSize = 4;

  const address = baseAddr + (i * cols + j) * elemSize;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: Array Address Calculation</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg text-center">
        int A[{rows}][{cols}]; &nbsp;&nbsp; // Base address: {baseAddr}, element size: {elemSize} bytes
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-slate-400 text-lg">Row i = {i}</label>
          <input type="range" min="0" max={rows - 1} value={i}
            onChange={(e) => setI(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg bg-slate-700" />
        </div>
        <div>
          <label className="text-slate-400 text-lg">Column j = {j}</label>
          <input type="range" min="0" max={cols - 1} value={j}
            onChange={(e) => setJ(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg bg-slate-700" />
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg mb-4">
        <div className="text-slate-400 text-base mb-2">Array visualization (highlight A[{i}][{j}]):</div>
        <div className="space-y-2">
          {Array(rows).fill(0).map((_, ri) => (
            <div key={ri} className="flex gap-2">
              {Array(cols).fill(0).map((_, ci) => (
                <div key={ci} className={`w-14 h-10 rounded flex items-center justify-center text-sm ${
                  ri === i && ci === j ? 'bg-teal-500 text-white font-bold' : 'bg-slate-700 text-slate-400'
                }`}>
                  [{ri}][{ci}]
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-teal-500/20 p-5 rounded-lg">
        <div className="text-teal-400 text-xl font-mono">
          addr(A[{i}][{j}]) = {baseAddr} + ({i} × {cols} + {j}) × {elemSize}<br/>
          <span className="ml-16">= {baseAddr} + {i * cols + j} × {elemSize}</span><br/>
          <span className="ml-16">= <strong>{address}</strong></span>
        </div>
      </div>
    </div>
  );
};

// String Representation Demo
const StringRepDemo = () => {
  const [style, setStyle] = useState('c');
  const str = "Hello";

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: String Representations</div>
      
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { id: 'c', name: 'C (null-terminated)' },
          { id: 'pascal', name: 'Pascal (length-prefixed)' },
          { id: 'java', name: 'Java (object)' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={`px-4 py-2 rounded-lg text-lg ${style === s.id ? 'bg-teal-500 text-white' : 'bg-slate-700'}`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="text-slate-400 text-base mb-2">Memory layout for "{str}":</div>
        
        {style === 'c' && (
          <div className="flex gap-1">
            {str.split('').map((c, i) => (
              <div key={i} className="w-12 h-12 bg-teal-500/30 rounded flex items-center justify-center text-xl font-mono text-white">
                '{c}'
              </div>
            ))}
            <div className="w-12 h-12 bg-red-500/30 rounded flex items-center justify-center text-lg font-mono text-red-400">
              \0
            </div>
          </div>
        )}

        {style === 'pascal' && (
          <div className="flex gap-1">
            <div className="w-12 h-12 bg-amber-500/30 rounded flex items-center justify-center text-xl font-mono text-amber-400">
              {str.length}
            </div>
            {str.split('').map((c, i) => (
              <div key={i} className="w-12 h-12 bg-teal-500/30 rounded flex items-center justify-center text-xl font-mono text-white">
                '{c}'
              </div>
            ))}
          </div>
        )}

        {style === 'java' && (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-slate-400 w-20">length:</span>
              <div className="w-16 h-10 bg-amber-500/30 rounded flex items-center justify-center font-mono text-amber-400">
                {str.length}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-slate-400 w-20">data:</span>
              <div className="flex gap-1">
                {str.split('').map((c, i) => (
                  <div key={i} className="w-10 h-10 bg-teal-500/30 rounded flex items-center justify-center font-mono text-white">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className={`p-3 rounded-lg ${style === 'c' ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
          <div className="text-slate-400 text-sm">Find length</div>
          <div className="text-white text-lg">{style === 'c' ? 'O(n) scan' : 'O(1)'}</div>
        </div>
        <div className={`p-3 rounded-lg ${style === 'c' ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
          <div className="text-slate-400 text-sm">Contains null?</div>
          <div className="text-white text-lg">{style === 'c' ? 'Cannot' : 'Can'}</div>
        </div>
        <div className={`p-3 rounded-lg ${style === 'java' ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
          <div className="text-slate-400 text-sm">Mutable?</div>
          <div className="text-white text-lg">{style === 'java' ? 'Immutable' : 'Mutable'}</div>
        </div>
      </div>
    </div>
  );
};

// Reference Counting Demo
const RefCountingDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { desc: 'Create object A, assign to p', p: 'A', q: null, countA: 1, countB: 0 },
    { desc: 'Create object B, assign to q', p: 'A', q: 'B', countA: 1, countB: 1 },
    { desc: 'Assign q = p (q now points to A)', p: 'A', q: 'A', countA: 2, countB: 0, freed: 'B' },
    { desc: 'Assign p = null', p: null, q: 'A', countA: 1, countB: 0 },
    { desc: 'Assign q = null (A freed!)', p: null, q: null, countA: 0, countB: 0, freed: 'A' }
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-teal-400 text-lg mb-4 font-mono">Interactive: Reference Counting</div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Pointers</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xl w-8">p:</span>
              <div className={`flex-1 h-10 rounded flex items-center justify-center ${
                current.p ? 'bg-blue-500/30' : 'bg-slate-700'
              }`}>
                <span className="font-mono text-lg">{current.p || 'null'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono text-xl w-8">q:</span>
              <div className={`flex-1 h-10 rounded flex items-center justify-center ${
                current.q ? 'bg-green-500/30' : 'bg-slate-700'
              }`}>
                <span className="font-mono text-lg">{current.q || 'null'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Objects (ref count)</div>
          <div className="space-y-2">
            <div className={`h-10 rounded flex items-center justify-between px-3 ${
              current.countA > 0 ? 'bg-teal-500/30' : 'bg-red-500/30'
            }`}>
              <span className="font-mono text-lg">Object A</span>
              <span className={`font-mono text-xl font-bold ${current.countA > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {current.countA}
              </span>
            </div>
            <div className={`h-10 rounded flex items-center justify-between px-3 ${
              current.countB > 0 ? 'bg-teal-500/30' : 'bg-red-500/30'
            }`}>
              <span className="font-mono text-lg">Object B</span>
              <span className={`font-mono text-xl font-bold ${current.countB > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {current.countB}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal-500/20 p-4 rounded-lg mb-4">
        <div className="text-teal-400 text-xl">{current.desc}</div>
        {current.freed && <div className="text-red-400 text-lg mt-2">🗑️ {current.freed} freed (count = 0)</div>}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="px-5 py-2 bg-slate-700 rounded text-lg">Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-5 py-2 bg-slate-700 rounded text-lg disabled:opacity-50">← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} 
          disabled={step >= steps.length - 1}
          className="px-5 py-2 bg-teal-600 rounded text-lg disabled:opacity-50">Next →</button>
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🏗️</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-teal-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-6 text-teal-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'struct-layout' && <StructLayoutDemo />}
    {slide.interactive?.type === 'union' && <UnionDemo />}
    {slide.interactive?.type === 'array-address' && <ArrayAddressDemo />}
    {slide.interactive?.type === 'string-rep' && <StringRepDemo />}
    {slide.interactive?.type === 'ref-counting' && <RefCountingDemo />}
    {slide.interactive?.type === 'garbage-collection' && <RefCountingDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    {slide.content.description && <p className="text-2xl text-slate-300 mb-6">{slide.content.description}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-green-400'}`}>{a.name}</h3>
          {a.how && <p className="text-white text-xl mb-2">{a.how}</p>}
          {a.used && <p className="text-slate-400 text-lg mb-2">Used by: {a.used}</p>}
          {a.example && <p className="text-slate-400 font-mono text-lg mb-2">{a.example}</p>}
          {a.characteristics && (
            <ul className="space-y-2 mt-3">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-lg">• {c}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    {slide.content.note && <p className="mt-6 text-teal-400 text-xl italic">{slide.content.note}</p>}
    {slide.interactive?.type === 'row-column-major' && <RowColumnMajorDemo />}
    {slide.interactive?.type === 'array-layout' && <RowColumnMajorDemo />}
  </div>
);

const SummarySlide = ({ slide }) => (
  <div className="h-full p-8 flex flex-col justify-center overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {slide.content.sections?.map((section, i) => (
        <div key={i} className="bg-slate-800/50 p-6 rounded-xl">
          <h3 className="text-teal-400 font-bold text-2xl mb-5">{section.title}</h3>
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
export default function Chapter8Slides({ onBackToChapters }) {
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
            <span className="text-teal-400 font-bold text-lg">Ch 8: {CHAPTER_CONFIG.title}</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 8 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-teal-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-teal-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-teal-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 rounded text-lg disabled:opacity-30">
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

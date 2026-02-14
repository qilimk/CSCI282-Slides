import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CHAPTER 10: DATA ABSTRACTION AND OBJECT ORIENTATION
// Programming Language Pragmatics, 4th Edition - Michael L. Scott
// Interactive Web-Based Slides
// ============================================================================

const CHAPTER_CONFIG = {
  number: 10,
  title: "Data Abstraction and Object Orientation",
  subtitle: "Programming Language Pragmatics, Fourth Edition",
  author: "Michael L. Scott",
  color: "#8b5cf6" // violet
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
    title: "Chapter 10: Data Abstraction and Object Orientation",
    content: {
      subtitle: "Objects, Classes, and Inheritance",
      topics: [
        "Abstract Data Types",
        "Encapsulation",
        "Inheritance",
        "Dynamic Method Binding",
        "Vtables",
        "Multiple Inheritance"
      ]
    }
  },

  // HISTORY OF ABSTRACTION
  {
    id: 2,
    section: "intro",
    type: "concept",
    title: "Evolution of Data Abstraction",
    content: {
      description: "Historical development of abstraction mechanisms:",
      items: [
        { icon: "📊", text: "Static Variables", detail: "BASIC - global variables only" },
        { icon: "📦", text: "Local Variables", detail: "Fortran, Algol - scoped to functions" },
        { icon: "🏗️", text: "Modules", detail: "Modula-2, Ada 83 - collection of related code" },
        { icon: "📐", text: "Module Types", detail: "Euclid - instantiable modules" },
        { icon: "🎯", text: "Objects", detail: "Smalltalk, C++, Java - full OOP" }
      ]
    }
  },

  // WHY ABSTRACTION
  {
    id: 3,
    section: "intro",
    type: "concept",
    title: "Why Abstraction?",
    content: {
      description: "Benefits of data abstraction:",
      items: [
        { icon: "🧠", text: "Easier to Think About", detail: "Hide what doesn't matter to the programmer" },
        { icon: "🛡️", text: "Protection", detail: "Prevent access to implementation details" },
        { icon: "🔌", text: "Plug Compatibility", detail: "Replace implementations without changing clients" },
        { icon: "👥", text: "Division of Labor", detail: "Teams can work on different components" }
      ]
    }
  },

  // THREE PILLARS OF OOP
  {
    id: 4,
    section: "oop",
    type: "concept",
    title: "Three Pillars of OOP",
    content: {
      description: "The key factors in object-oriented programming:",
      items: [
        { icon: "📦", text: "Encapsulation", detail: "Bundling data with methods, hiding internals" },
        { icon: "🧬", text: "Inheritance", detail: "Deriving new classes from existing ones" },
        { icon: "🔄", text: "Polymorphism", detail: "Dynamic method binding - same interface, different behavior" }
      ],
      note: "Simula 67 introduced inheritance and dynamic binding but lacked data hiding"
    },
    interactive: { type: "three-pillars" }
  },

  // ENCAPSULATION
  {
    id: 5,
    section: "encapsulation",
    type: "concept",
    title: "Encapsulation",
    content: {
      description: "Bundling data and methods, controlling access:",
      items: [
        { icon: "🔓", text: "Public", detail: "Accessible to anyone" },
        { icon: "🔐", text: "Protected", detail: "Accessible to class and its subclasses" },
        { icon: "🔒", text: "Private", detail: "Accessible only within the class" }
      ],
      code: `class BankAccount {
private:
    double balance;     // Hidden!
public:
    void deposit(double amt);
    double getBalance();
};`
    },
    interactive: { type: "access-modifiers" }
  },

  // CONSTRUCTORS AND DESTRUCTORS
  {
    id: 6,
    section: "encapsulation",
    type: "concept",
    title: "Constructors and Destructors",
    content: {
      description: "Automatic initialization and cleanup:",
      items: [
        { icon: "🏗️", text: "Constructor", detail: "Called when object is created - initialize state" },
        { icon: "🗑️", text: "Destructor", detail: "Called when object is destroyed - cleanup resources" },
        { icon: "⚙️", text: "RAII", detail: "Resource Acquisition Is Initialization (C++)" }
      ],
      code: `class File {
public:
    File(string name) { fp = open(name); }  // Constructor
    ~File() { close(fp); }                   // Destructor
private:
    FILE* fp;
};`
    }
  },

  // INHERITANCE
  {
    id: 7,
    section: "inheritance",
    type: "concept",
    title: "Inheritance",
    content: {
      description: "Creating new classes from existing ones:",
      items: [
        { icon: "👆", text: "Base/Parent Class", detail: "The class being inherited from" },
        { icon: "👇", text: "Derived/Child Class", detail: "The class that inherits" },
        { icon: "➕", text: "Extension", detail: "Child adds new members" },
        { icon: "✏️", text: "Override", detail: "Child replaces parent's method" }
      ],
      code: `class Animal {
    void speak() { cout << "..."; }
};
class Dog : public Animal {
    void speak() { cout << "Woof!"; }  // Override
    void fetch() { /* new method */ }   // Extend
};`
    },
    interactive: { type: "inheritance" }
  },

  // MEMORY LAYOUT WITH INHERITANCE
  {
    id: 8,
    section: "inheritance",
    type: "concept",
    title: "Object Memory Layout",
    content: {
      description: "How derived objects are laid out in memory:",
      items: [
        { icon: "📐", text: "Parent First", detail: "Base class members come first" },
        { icon: "➕", text: "Extension", detail: "Derived class adds members at the end" },
        { icon: "👆", text: "Pointer Compatibility", detail: "Child* can be used as Parent*" }
      ]
    },
    interactive: { type: "object-layout" }
  },

  // DYNAMIC METHOD BINDING
  {
    id: 9,
    section: "dynamic",
    type: "concept",
    title: "Dynamic Method Binding",
    content: {
      description: "Choosing the right method at runtime:",
      items: [
        { icon: "⏱️", text: "Runtime Decision", detail: "Method chosen based on actual object type, not variable type" },
        { icon: "🎯", text: "Virtual Functions", detail: "C++ keyword to enable dynamic binding" },
        { icon: "📋", text: "Vtable", detail: "Table of function pointers for virtual methods" }
      ],
      code: `Animal* a = new Dog();
a->speak();  // Which speak()?
// Static: Animal::speak()
// Dynamic (virtual): Dog::speak()`
    },
    interactive: { type: "dynamic-binding" }
  },

  // VTABLE
  {
    id: 10,
    section: "dynamic",
    type: "concept",
    title: "Vtable Implementation",
    content: {
      description: "How virtual functions work under the hood:",
      items: [
        { icon: "📋", text: "Vtable", detail: "Per-class table of function pointers" },
        { icon: "👆", text: "Vptr", detail: "Per-object pointer to its class's vtable" },
        { icon: "🔍", text: "Lookup", detail: "Call = vptr->vtable[method_index]()" },
        { icon: "⚡", text: "Cost", detail: "One extra indirection (pointer chase)" }
      ]
    },
    interactive: { type: "vtable" }
  },

  // ABSTRACT CLASSES
  {
    id: 11,
    section: "dynamic",
    type: "concept",
    title: "Abstract Classes and Interfaces",
    content: {
      description: "Classes that cannot be instantiated:",
      items: [
        { icon: "📝", text: "Abstract Class", detail: "Has at least one pure virtual function" },
        { icon: "0️⃣", text: "Pure Virtual", detail: "virtual void f() = 0; (no implementation)" },
        { icon: "📋", text: "Interface", detail: "All methods abstract (Java, C#)" },
        { icon: "📜", text: "Contract", detail: "Defines what derived classes must implement" }
      ],
      code: `class Shape {  // Abstract
public:
    virtual double area() = 0;  // Pure virtual
};
// Shape s;  // ERROR - can't instantiate
class Circle : public Shape {
    double area() { return 3.14 * r * r; }  // Must implement
};`
    }
  },

  // SINGLE VS MULTIPLE INHERITANCE
  {
    id: 12,
    section: "multiple",
    type: "comparison",
    title: "Single vs Multiple Inheritance",
    content: {
      approaches: [
        {
          name: "Single Inheritance",
          characteristics: [
            "One parent class only",
            "Simple, unambiguous",
            "Linear hierarchy",
            "Java, C#, Ruby"
          ]
        },
        {
          name: "Multiple Inheritance",
          characteristics: [
            "Multiple parent classes",
            "Diamond problem",
            "Name conflicts",
            "C++, Python"
          ]
        }
      ]
    },
    interactive: { type: "inheritance-types" }
  },

  // DIAMOND PROBLEM
  {
    id: 13,
    section: "multiple",
    type: "concept",
    title: "The Diamond Problem",
    content: {
      description: "Ambiguity with multiple inheritance:",
      items: [
        { icon: "💎", text: "Diamond Shape", detail: "D inherits B and C, both inherit A" },
        { icon: "❓", text: "Which A?", detail: "Does D have one A or two?" },
        { icon: "🔧", text: "C++ Solution", detail: "Virtual base classes for shared parent" }
      ]
    },
    interactive: { type: "diamond" }
  },

  // MIX-IN / INTERFACES
  {
    id: 14,
    section: "multiple",
    type: "concept",
    title: "Mix-In Inheritance (Interfaces)",
    content: {
      description: "The modern solution to multiple inheritance:",
      items: [
        { icon: "1️⃣", text: "One Real Parent", detail: "Single inheritance for implementation" },
        { icon: "📋", text: "Multiple Interfaces", detail: "Implement many interfaces" },
        { icon: "✅", text: "No Diamond Problem", detail: "Interfaces have no state" },
        { icon: "🌍", text: "Dominant Approach", detail: "Java, C#, Go, Swift" }
      ],
      code: `interface Drawable { void draw(); }
interface Serializable { void save(); }

class Shape implements Drawable, Serializable {
    void draw() { /* ... */ }
    void save() { /* ... */ }
}`
    }
  },

  // STATIC VS DYNAMIC TYPING IN OOP
  {
    id: 15,
    section: "typing",
    type: "comparison",
    title: "Static vs Dynamic OOP",
    content: {
      approaches: [
        {
          name: "Static (C++, Java)",
          characteristics: [
            "Types checked at compile time",
            "Virtual keyword needed (C++)",
            "vtable per class",
            "Fast method dispatch"
          ]
        },
        {
          name: "Dynamic (Smalltalk, Python)",
          characteristics: [
            "Types checked at runtime",
            "All methods 'virtual'",
            "Message passing model",
            "Duck typing"
          ]
        }
      ]
    }
  },

  // THIS/SELF POINTER
  {
    id: 16,
    section: "impl",
    type: "concept",
    title: "The this/self Pointer",
    content: {
      description: "How methods know which object they're operating on:",
      items: [
        { icon: "👆", text: "Hidden Parameter", detail: "Every method receives pointer to object" },
        { icon: "🏷️", text: "this (C++, Java)", detail: "Pointer to current object" },
        { icon: "🐍", text: "self (Python)", detail: "Explicit first parameter" },
        { icon: "💎", text: "current (Eiffel)", detail: "Reference to current object" }
      ],
      code: `// What the compiler sees:
// obj.method(x) → method(&obj, x)

class C {
    int x;
    void f() { x = 5; }  // this->x = 5
};`
    }
  },

  // OOP LANGUAGE COMPARISON
  {
    id: 17,
    section: "languages",
    type: "table",
    title: "OOP Language Comparison",
    content: {
      headers: ["Feature", "C++", "Java", "Python", "Smalltalk"],
      rows: [
        ["All methods virtual?", "No", "Yes", "Yes", "Yes"],
        ["Multiple inheritance?", "Yes", "Interfaces", "Yes", "No"],
        ["Destructors?", "Yes", "Finalizers", "No", "No"],
        ["Static typing?", "Yes", "Yes", "No", "No"],
        ["Everything an object?", "No", "Almost", "Yes", "Yes"]
      ]
    }
  },

  // SMALLTALK
  {
    id: 18,
    section: "languages",
    type: "concept",
    title: "Smalltalk: Pure OOP",
    content: {
      description: "The canonical object-oriented language:",
      items: [
        { icon: "🌟", text: "Everything is an Object", detail: "Even numbers, classes, code blocks" },
        { icon: "📨", text: "Message Passing", detail: "Objects communicate via messages" },
        { icon: "🔄", text: "All Methods Virtual", detail: "Dynamic binding by default" },
        { icon: "🏠", text: "Live Environment", detail: "Interactive, image-based development" }
      ],
      code: `"Smalltalk example"
3 + 4          "send + message to 3"
'hello' size   "send size message to string"`
    }
  },

  // IS C++ OOP?
  {
    id: 19,
    section: "languages",
    type: "concept",
    title: "Is C++ Object-Oriented?",
    content: {
      description: "C++ supports but doesn't enforce OOP:",
      items: [
        { icon: "✅", text: "Has OOP Features", detail: "Classes, inheritance, virtual functions" },
        { icon: "🔀", text: "Multi-Paradigm", detail: "Also procedural, generic, functional" },
        { icon: "⚡", text: "Pay-for-what-you-use", detail: "Virtual only when needed" },
        { icon: "🚪", text: "Escape Hatches", detail: "Can bypass abstraction (pointers, friends)" }
      ],
      note: "C++ CAN be used in an OOP style, but doesn't require it"
    }
  },

  // SUMMARY
  {
    id: 20,
    section: "summary",
    type: "summary",
    title: "Chapter 10 Summary",
    content: {
      sections: [
        {
          title: "Core Concepts",
          points: [
            "Encapsulation: hide implementation details",
            "Inheritance: extend existing classes",
            "Polymorphism: same interface, different behavior"
          ]
        },
        {
          title: "Implementation",
          points: [
            "Vtables for virtual function dispatch",
            "this pointer passed to all methods",
            "Derived objects extend parent layout"
          ]
        },
        {
          title: "Design Choices",
          points: [
            "Single vs multiple inheritance",
            "Interfaces for safe multiple inheritance",
            "Static vs dynamic method binding"
          ]
        }
      ]
    }
  }
];

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

// Three Pillars Demo
const ThreePillarsDemo = () => {
  const [selected, setSelected] = useState('encapsulation');

  const pillars = {
    encapsulation: {
      title: 'Encapsulation',
      icon: '📦',
      description: 'Bundle data and methods together, hide implementation details',
      example: `class BankAccount {
  private balance;  // Hidden
  public deposit(amt) { balance += amt; }
  public getBalance() { return balance; }
}`
    },
    inheritance: {
      title: 'Inheritance',
      icon: '🧬',
      description: 'Create new classes based on existing ones, reuse code',
      example: `class Animal { void speak(); }
class Dog extends Animal {
  void speak() { print("Woof!"); }
  void fetch() { /* new */ }
}`
    },
    polymorphism: {
      title: 'Polymorphism',
      icon: '🔄',
      description: 'Same interface, different behavior based on actual type',
      example: `Animal a = new Dog();
a.speak();  // "Woof!" - Dog's method
Animal b = new Cat();
b.speak();  // "Meow!" - Cat's method`
    }
  };

  const current = pillars[selected];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Three Pillars of OOP</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        {Object.entries(pillars).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-5 py-3 rounded-lg text-lg flex items-center gap-2 ${
              selected === key ? 'bg-violet-500 text-white' : 'bg-slate-700'
            }`}
          >
            <span className="text-2xl">{p.icon}</span>
            {p.title}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-5 rounded-lg">
        <div className="text-violet-400 font-bold text-2xl mb-3">{current.icon} {current.title}</div>
        <div className="text-slate-300 text-xl mb-4">{current.description}</div>
        <pre className="text-green-400 font-mono text-base bg-slate-950 p-4 rounded">{current.example}</pre>
      </div>
    </div>
  );
};

// Access Modifiers Demo
const AccessModifiersDemo = () => {
  const [accessor, setAccessor] = useState('class');

  const members = [
    { name: 'publicMethod()', access: 'public', emoji: '🔓' },
    { name: 'protectedData', access: 'protected', emoji: '🔐' },
    { name: 'privateSecret', access: 'private', emoji: '🔒' }
  ];

  const canAccess = (memberAccess) => {
    if (accessor === 'class') return true;
    if (accessor === 'subclass') return memberAccess !== 'private';
    if (accessor === 'outside') return memberAccess === 'public';
    return false;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Access Modifiers</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        {[
          { id: 'class', label: 'Same Class' },
          { id: 'subclass', label: 'Subclass' },
          { id: 'outside', label: 'Outside Code' }
        ].map(a => (
          <button
            key={a.id}
            onClick={() => setAccessor(a.id)}
            className={`px-5 py-2 rounded-lg text-lg ${accessor === a.id ? 'bg-violet-500 text-white' : 'bg-slate-700'}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {members.map((m, i) => {
          const accessible = canAccess(m.access);
          return (
            <div key={i} className={`p-4 rounded-lg flex items-center justify-between ${
              accessible ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-mono text-xl text-white">{m.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  m.access === 'public' ? 'bg-green-500/30 text-green-400' :
                  m.access === 'protected' ? 'bg-amber-500/30 text-amber-400' :
                  'bg-red-500/30 text-red-400'
                }`}>
                  {m.access}
                </span>
              </div>
              <span className={`text-xl font-bold ${accessible ? 'text-green-400' : 'text-red-400'}`}>
                {accessible ? '✓ Accessible' : '✗ Not Accessible'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Inheritance Demo
const InheritanceDemo = () => {
  const [showDerived, setShowDerived] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Inheritance</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setShowDerived(false)}
          className={`px-5 py-2 rounded-lg text-lg ${!showDerived ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Base: Animal
        </button>
        <button onClick={() => setShowDerived(true)}
          className={`px-5 py-2 rounded-lg text-lg ${showDerived ? 'bg-violet-500 text-white' : 'bg-slate-700'}`}>
          Derived: Dog
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg border-2 ${!showDerived ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-900'}`}>
          <div className="text-blue-400 font-bold text-xl mb-3">class Animal</div>
          <div className="space-y-2 font-mono">
            <div className="text-slate-300">- name: string</div>
            <div className="text-slate-300">- age: int</div>
            <div className="text-green-400">+ speak(): void</div>
            <div className="text-green-400">+ eat(): void</div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${showDerived ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 bg-slate-900'}`}>
          <div className="text-violet-400 font-bold text-xl mb-3">class Dog : Animal</div>
          <div className="space-y-2 font-mono">
            <div className="text-slate-500">// Inherited:</div>
            <div className="text-slate-500">- name, age</div>
            <div className="text-amber-400">+ speak() // Override</div>
            <div className="text-slate-500">+ eat()</div>
            <div className="text-slate-500">// New:</div>
            <div className="text-green-400">+ fetch(): void</div>
            <div className="text-green-400">+ bark(): void</div>
          </div>
        </div>
      </div>

      {showDerived && (
        <div className="mt-4 bg-violet-500/20 p-4 rounded-lg">
          <div className="text-violet-400">Dog inherits from Animal: gets name, age, eat(). Overrides speak(), adds fetch(), bark()</div>
        </div>
      )}
    </div>
  );
};

// Object Layout Demo
const ObjectLayoutDemo = () => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Object Memory Layout</div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-blue-400 font-bold text-lg mb-2">Animal object</div>
          <div className="space-y-1">
            <div className="p-3 bg-slate-700 rounded text-center font-mono">vptr</div>
            <div className="p-3 bg-blue-500/30 rounded text-center font-mono">name</div>
            <div className="p-3 bg-blue-500/30 rounded text-center font-mono">age</div>
          </div>
        </div>

        <div>
          <div className="text-violet-400 font-bold text-lg mb-2">Dog object</div>
          <div className="space-y-1">
            <div className="p-3 bg-slate-700 rounded text-center font-mono">vptr</div>
            <div className="p-3 bg-blue-500/30 rounded text-center font-mono border-l-4 border-blue-500">name</div>
            <div className="p-3 bg-blue-500/30 rounded text-center font-mono border-l-4 border-blue-500">age</div>
            <div className="p-3 bg-violet-500/30 rounded text-center font-mono border-l-4 border-violet-500">breed</div>
          </div>
          <div className="mt-2 text-slate-400 text-sm">↑ Parent part | ↑ New fields</div>
        </div>
      </div>

      <div className="mt-4 bg-slate-900 p-4 rounded-lg">
        <div className="text-slate-300">Dog* d = new Dog();</div>
        <div className="text-slate-300">Animal* a = d; <span className="text-green-400">// OK! Points to same address</span></div>
        <div className="text-slate-400 text-sm mt-2">Both pointers have same value - Dog layout starts with Animal layout</div>
      </div>
    </div>
  );
};

// Dynamic Binding Demo
const DynamicBindingDemo = () => {
  const [isVirtual, setIsVirtual] = useState(true);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Static vs Dynamic Binding</div>
      
      <div className="bg-slate-900 p-4 rounded-lg mb-4 font-mono text-lg">
        <span className="text-blue-400">Animal</span>* a = <span className="text-violet-400">new Dog()</span>;<br/>
        a-&gt;speak();  <span className="text-slate-500">// Which speak() is called?</span>
      </div>

      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setIsVirtual(false)}
          className={`px-5 py-2 rounded-lg text-lg ${!isVirtual ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Non-Virtual (static)
        </button>
        <button onClick={() => setIsVirtual(true)}
          className={`px-5 py-2 rounded-lg text-lg ${isVirtual ? 'bg-violet-500 text-white' : 'bg-slate-700'}`}>
          Virtual (dynamic)
        </button>
      </div>

      <div className={`p-5 rounded-lg ${isVirtual ? 'bg-violet-500/20 border border-violet-500' : 'bg-blue-500/20 border border-blue-500'}`}>
        {isVirtual ? (
          <div>
            <div className="text-violet-400 text-2xl font-bold mb-2">Dog::speak() called!</div>
            <div className="text-slate-300 text-lg">Runtime looks at actual object type (Dog), uses Dog's method</div>
            <div className="text-slate-400 mt-2">Output: "Woof!"</div>
          </div>
        ) : (
          <div>
            <div className="text-blue-400 text-2xl font-bold mb-2">Animal::speak() called!</div>
            <div className="text-slate-300 text-lg">Compiler uses declared type (Animal*), ignores actual type</div>
            <div className="text-slate-400 mt-2">Output: "..."</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Vtable Demo
const VtableDemo = () => {
  const [objectType, setObjectType] = useState('dog');

  const vtables = {
    animal: ['Animal::speak', 'Animal::eat'],
    dog: ['Dog::speak', 'Animal::eat', 'Dog::fetch']
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Vtable Lookup</div>
      
      <div className="flex gap-3 mb-6 justify-center">
        <button onClick={() => setObjectType('animal')}
          className={`px-5 py-2 rounded-lg text-lg ${objectType === 'animal' ? 'bg-blue-500 text-white' : 'bg-slate-700'}`}>
          Animal object
        </button>
        <button onClick={() => setObjectType('dog')}
          className={`px-5 py-2 rounded-lg text-lg ${objectType === 'dog' ? 'bg-violet-500 text-white' : 'bg-slate-700'}`}>
          Dog object
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg">
          <div className="text-slate-400 text-base mb-2">Object</div>
          <div className="p-3 bg-amber-500/30 rounded text-center font-mono mb-1">vptr →</div>
          <div className="p-3 bg-slate-700 rounded text-center font-mono mb-1">data...</div>
        </div>

        <div className="flex items-center justify-center text-4xl text-slate-500">→</div>

        <div className="bg-slate-900 p-4 rounded-lg">
          <div className={`text-base mb-2 ${objectType === 'dog' ? 'text-violet-400' : 'text-blue-400'}`}>
            {objectType === 'dog' ? 'Dog vtable' : 'Animal vtable'}
          </div>
          {vtables[objectType].map((fn, i) => (
            <div key={i} className={`p-2 rounded text-center font-mono mb-1 text-sm ${
              fn.startsWith('Dog') ? 'bg-violet-500/30 text-violet-400' : 'bg-blue-500/30 text-blue-400'
            }`}>
              [{i}] {fn}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-slate-900 p-4 rounded-lg font-mono text-base">
        <span className="text-slate-400">// obj-&gt;speak() compiles to:</span><br/>
        (obj-&gt;vptr[0])(obj)  <span className="text-green-400">// {vtables[objectType][0]}</span>
      </div>
    </div>
  );
};

// Diamond Problem Demo
const DiamondDemo = () => {
  const [virtual, setVirtual] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <div className="text-violet-400 text-lg mb-4 font-mono">Interactive: Diamond Problem</div>
      
      <div className="flex justify-center mb-6">
        <svg width="200" height="180" className="text-white">
          {/* A at top */}
          <rect x="75" y="10" width="50" height="30" fill="#3b82f6" rx="4"/>
          <text x="100" y="30" textAnchor="middle" fill="white" fontSize="14">A</text>
          
          {/* B and C */}
          <rect x="25" y="70" width="50" height="30" fill="#8b5cf6" rx="4"/>
          <text x="50" y="90" textAnchor="middle" fill="white" fontSize="14">B</text>
          <rect x="125" y="70" width="50" height="30" fill="#8b5cf6" rx="4"/>
          <text x="150" y="90" textAnchor="middle" fill="white" fontSize="14">C</text>
          
          {/* D at bottom */}
          <rect x="75" y="130" width="50" height="30" fill="#f43f5e" rx="4"/>
          <text x="100" y="150" textAnchor="middle" fill="white" fontSize="14">D</text>
          
          {/* Lines */}
          <line x1="85" y1="40" x2="60" y2="70" stroke="white" strokeWidth="2"/>
          <line x1="115" y1="40" x2="140" y2="70" stroke="white" strokeWidth="2"/>
          <line x1="60" y1="100" x2="85" y2="130" stroke="white" strokeWidth="2"/>
          <line x1="140" y1="100" x2="115" y2="130" stroke="white" strokeWidth="2"/>
        </svg>
      </div>

      <div className="flex gap-3 mb-4 justify-center">
        <button onClick={() => setVirtual(false)}
          className={`px-4 py-2 rounded-lg text-lg ${!virtual ? 'bg-red-500 text-white' : 'bg-slate-700'}`}>
          Regular Inheritance
        </button>
        <button onClick={() => setVirtual(true)}
          className={`px-4 py-2 rounded-lg text-lg ${virtual ? 'bg-green-500 text-white' : 'bg-slate-700'}`}>
          Virtual Inheritance
        </button>
      </div>

      <div className={`p-4 rounded-lg ${virtual ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {virtual ? (
          <div>
            <div className="text-green-400 text-xl font-bold mb-2">✓ One copy of A</div>
            <div className="text-slate-300">class B : virtual public A</div>
            <div className="text-slate-300">class C : virtual public A</div>
            <div className="text-slate-300">D has single, shared A</div>
          </div>
        ) : (
          <div>
            <div className="text-red-400 text-xl font-bold mb-2">⚠ Two copies of A!</div>
            <div className="text-slate-300">D contains B's A and C's A</div>
            <div className="text-slate-300">d.x is ambiguous - which A's x?</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SLIDE RENDERERS
// ============================================================================

const TitleSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="text-7xl mb-8">🎯</div>
    <h1 className="text-5xl font-bold text-white mb-6">{slide.title}</h1>
    {slide.content.subtitle && <h2 className="text-2xl text-violet-400 mb-10">{slide.content.subtitle}</h2>}
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
    {slide.content.note && <p className="mt-6 text-violet-400 italic text-xl">{slide.content.note}</p>}
    {slide.interactive?.type === 'three-pillars' && <ThreePillarsDemo />}
    {slide.interactive?.type === 'access-modifiers' && <AccessModifiersDemo />}
    {slide.interactive?.type === 'inheritance' && <InheritanceDemo />}
    {slide.interactive?.type === 'object-layout' && <ObjectLayoutDemo />}
    {slide.interactive?.type === 'dynamic-binding' && <DynamicBindingDemo />}
    {slide.interactive?.type === 'vtable' && <VtableDemo />}
    {slide.interactive?.type === 'diamond' && <DiamondDemo />}
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full p-8 overflow-auto">
    <h2 className="text-5xl font-bold text-white mb-8">{slide.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slide.content.approaches?.map((a, i) => (
        <div key={i} className={`p-6 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-500/10' : 'border-violet-500 bg-violet-500/10'}`}>
          <h3 className={`font-bold text-2xl mb-3 ${i === 0 ? 'text-blue-400' : 'text-violet-400'}`}>{a.name}</h3>
          {a.characteristics && (
            <ul className="space-y-2">
              {a.characteristics.map((c, j) => (
                <li key={j} className="text-slate-300 text-xl">• {c}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    {slide.interactive?.type === 'inheritance-types' && <DiamondDemo />}
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
              <th key={i} className="text-left p-4 text-violet-400 font-bold text-xl">{h}</th>
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
          <h3 className="text-violet-400 font-bold text-2xl mb-5">{section.title}</h3>
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
export default function Chapter10Slides({ onBackToChapters }) {
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
            <span className="text-violet-400 font-bold text-lg">Ch 10: OOP</span>
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
            <h3 className="text-2xl font-bold mb-4">Chapter 10 Slides</h3>
            {sections.map(section => (
              <div key={section} className="mb-4">
                <h4 className="text-violet-400 text-sm uppercase tracking-wider mb-2">{section}</h4>
                {SLIDES.filter(s => s.section === section).map(s => (
                  <button key={s.id} onClick={() => { setCurrentSlide(SLIDES.indexOf(s)); setShowMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded mb-1 text-base ${
                      SLIDES.indexOf(s) === currentSlide ? 'bg-violet-500 text-white' : 'hover:bg-slate-700'
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
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }} />
            </div>
          </div>
          <button onClick={() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1))} disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 rounded text-lg disabled:opacity-30">
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

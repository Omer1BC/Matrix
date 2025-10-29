const problemCategories = {
    introduction: {
      title: "Introduction",
      icon: "🚀",
      items: [
        { id: "intro-1", title: "Hello World", description: "Your first Python program", difficulty: "Easy" },
        { id: "intro-2", title: "Basic Variables", description: "Working with variables and types", difficulty: "Easy" },
        { id: "intro-3", title: "Simple Math", description: "Basic arithmetic operations", difficulty: "Easy" },
        { id: "intro-4", title: "String Manipulation", description: "Working with strings", difficulty: "Easy" }
      ]
    },
    datastructures: {
      title: "Data Structures",
      icon: "📊",
      items: [
        { id: "ds-1", title: "Arrays & Lists", description: "Working with Python lists", difficulty: "Medium" },
        { id: "ds-2", title: "Dictionary Basics", description: "Key-value pair operations", difficulty: "Medium" },
        { id: "ds-3", title: "Stack Implementation", description: "LIFO data structure", difficulty: "Medium" },
        { id: "ds-4", title: "Queue Operations", description: "FIFO data structure", difficulty: "Hard" },
        { id: "ds-5", title: "Linked Lists", description: "Node-based data structure", difficulty: "Hard" }
      ]
    },
    sorting: {
      title: "Sorting Problems",
      icon: "🔄",
      items: [
        { id: "sort-1", title: "Bubble Sort", description: "Simple sorting algorithm", difficulty: "Easy" },
        { id: "sort-2", title: "Selection Sort", description: "Find minimum and swap", difficulty: "Easy" },
        { id: "sort-3", title: "Insertion Sort", description: "Insert elements in order", difficulty: "Medium" },
        { id: "sort-4", title: "Merge Sort", description: "Divide and conquer sorting", difficulty: "Hard" },
        { id: "sort-5", title: "Quick Sort", description: "Efficient pivot-based sort", difficulty: "Hard" }
      ]
    },
    counting: {
      title: "Counting Problems",
      icon: "🔢",
      items: [
        { id: "count-1", title: "Count Elements", description: "Count occurrences in array", difficulty: "Easy" },
        { id: "count-2", title: "Frequency Counter", description: "Character frequency counting", difficulty: "Medium" },
        { id: "count-3", title: "Unique Elements", description: "Find unique items", difficulty: "Medium" },
        { id: "count-4", title: "Permutations", description: "Count possible arrangements", difficulty: "Hard" },
        { id: "count-5", title: "Combinations", description: "Count possible selections", difficulty: "Hard" }
      ]
    },
    decision: {
      title: "Decision Problems",
      icon: "🤔",
      items: [
        { id: "dec-1", title: "Even or Odd", description: "Determine number parity", difficulty: "Easy" },
        { id: "dec-2", title: "Prime Check", description: "Check if number is prime", difficulty: "Medium" },
        { id: "dec-3", title: "Palindrome", description: "Check string palindrome", difficulty: "Medium" },
        { id: "dec-4", title: "Valid Parentheses", description: "Check bracket matching", difficulty: "Hard" },
        { id: "dec-5", title: "Binary Search", description: "Search in sorted array", difficulty: "Hard" }
      ]
    }
  };
export default problemCategories
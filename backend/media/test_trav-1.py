from typing import *

class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None

def fibonacci(n: int) -> int:
    """Calculate fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def build_fib_tree(n: int) -> Optional[TreeNode]:
    """Build a tree where each node contains fibonacci numbers"""
    if n <= 1:
        return TreeNode(1 if n == 1 else 0)
    
    root = TreeNode(fibonacci(n))
    if n > 1:
        root.left = build_fib_tree(n-1)
    if n > 2:
        root.right = build_fib_tree(n-2)
    return root

def dfs_fibonacci_tree(root: Optional[TreeNode]) -> List[int]:
    """
    Perform DFS traversal on fibonacci tree.
    Returns list of values in DFS pre-order.
    """
    # User code will be inserted here
    pass

# DFS traversal of fibonacci tree

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def build_fib_tree(n):
    """
    Build a tree where each node contains fibonacci numbers.
    Left child: fib(n-1), Right child: fib(n-2)
    """
    if n <= 1:
        return TreeNode(1 if n == 1 else 0)
    
    root = TreeNode(fibonacci(n))
    if n > 1:
        root.left = build_fib_tree(n-1)
    if n > 2:
        root.right = build_fib_tree(n-2)
    return root

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def dfs_fibonacci_tree(root):
    """
    Perform DFS traversal on fibonacci tree.
    Returns list of values in DFS pre-order.
    """
    # Implement DFS traversal
    pass


def run_test(n, expected_length):
    exception = ""
    result = ""
    try:
        fib_tree = build_fib_tree(n)
        result = dfs_fibonacci_tree(fib_tree)
        # We'll check if the result has the right length and starts with the right value
        is_valid = len(result) == expected_length and (len(result) == 0 or result[0] == fibonacci(n))
        
    except Exception as e:
        exception = str(e)
        is_valid = False
    return {
        "n": n, 
        "expected_length": expected_length,
        "actual": result, 
        "error": exception,
        "passed": is_valid if not exception else False
    }

test_cases = [
    (4, 7),  # fib tree of depth 4 has 7 nodes
    (3, 5),  # fib tree of depth 3 has 5 nodes  
    (2, 3),  # fib tree of depth 2 has 3 nodes
    (1, 1),  # fib tree of depth 1 has 1 node
    (0, 1),  # fib tree of depth 0 has 1 node
]

# Generate results without printing
results = {f"test_{i}": run_test(n, expected_length) for i, (n, expected_length) in enumerate(test_cases)}
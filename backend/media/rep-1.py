''''''
from typing import *
from collections import defaultdict
''''''
def edges_to_adj_list(edges: List[List[int]]) -> Dict[int, List[int]]:
    """Convert edge list to adjacency list representation"""
    # User code will be inserted here
    pass
''''''
def run_test(edges, expected):
    exception = ""
    result = ""
    try:
        raw_result = edges_to_adj_list(edges)
        # Sort the dictionary keys and the lists within each key for consistent comparison
        result = {k: sorted(v) for k, v in sorted(raw_result.items())} if raw_result else {}
        expected_sorted = {k: sorted(v) for k, v in sorted(expected.items())} if expected else {}
    except Exception as e:
        exception = str(e)
        expected_sorted = expected
    return {
        "nums": edges, 
        "expected": expected_sorted,
        "actual": result, 
        "error": exception,
        "passed": result == expected_sorted if not exception else False
    }

test_cases = [
    (
        [[1, 2], [2, 3], [1, 3]],
        {1: [2, 3], 2: [1, 3], 3: [1, 2]}
    ),
    (
        [],
        {}
    ),
    (
        [[0, 1], [1, 2]],
        {0: [1], 1: [0, 2], 2: [1]}
    ),
    (
        [[5, 6]],
        {5: [6], 6: [5]}
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(edges, expected) for i, (edges, expected) in enumerate(test_cases)}
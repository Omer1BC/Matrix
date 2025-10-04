''''''
from typing import *
''''''
def edges_to_adj_matrix(edges: List[List[int]]) -> List[List[int]]:
    """Convert edge list to adjacency matrix representation"""
    # User code will be inserted here
    pass
''''''
def run_test(edges, expected):
    exception = ""
    result = ""
    try:
        result = edges_to_adj_matrix(edges)

    except Exception as e:
        exception = str(e)
    return {
        "nums": edges,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        [[1, 2], [2, 3], [1, 3]],
        [[0, 1, 1, 0], [0, 0, 1, 1], [0, 1, 0, 1], [0, 0, 0, 0]]
    ),
    (
        [],
        []
    ),
    (
        [[0, 1], [1, 2]],
        [[0, 1, 0], [0, 0, 1], [0, 0, 0]]
    ),
    (
        [[5, 6]],
        [[0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0]]
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(edges, expected) for i, (edges, expected) in enumerate(test_cases)}
''''''
from typing import *
''''''
def are_valid_components(edges: List[Tuple[int, int]], num_vertices: int) -> bool:
    """
    Check if the given edges form valid connected components.
    
    Args:
        edges: list of tuples representing edges [(u, v), ...]
        num_vertices: total number of vertices expected
    
    Returns:
        bool: True if edges form valid components, False otherwise
    """
    # User code will be inserted here
    pass
''''''
def run_test(test_data, expected):
    exception = ""
    result = ""
    try:
        result = are_valid_components(test_data["edges"], test_data["num_vertices"])
    except Exception as e:
        exception = str(e)
    return {
        "test_data": test_data, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        {"edges": [(0, 1), (1, 2), (3, 4)], "num_vertices": 5},
        True
    ),
    (
        {"edges": [(0, 1), (0, 1)], "num_vertices": 2},
        False
    ),
    (
        {"edges": [(0, 0)], "num_vertices": 1},
        False
    ),
    (
        {"edges": [(0, 5)], "num_vertices": 3},
        False
    ),
    (
        {"edges": [], "num_vertices": 0},
        True
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(test_data, expected) for i, (test_data, expected) in enumerate(test_cases)}
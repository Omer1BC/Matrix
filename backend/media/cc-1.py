''''''
from typing import *
''''''
def count_components(graph: Dict[str, List[str]]) -> int:
    """
    Count the number of connected components in an undirected graph.
    
    Args:
        graph: Dictionary representing the undirected graph
    
    Returns:
        int: Number of connected components
    """
    # User code will be inserted here
    pass
''''''
def run_test(graph, expected):
    exception = ""
    result = ""
    try:
        result = count_components(graph)
    except Exception as e:
        exception = str(e)
    return {
        "graph": graph, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        {"A": ["B"], "B": ["A"], "C": ["D"], "D": ["C"], "E": []},
        3
    ),
    (
        {"A": ["B", "C"], "B": ["A"], "C": ["A"]},
        1
    ),
    (
        {"A": [], "B": [], "C": []},
        3
    ),
    (
        {},
        0
    ),
    (
        {"A": ["B", "C", "D"], "B": ["A"], "C": ["A"], "D": ["A"]},
        1
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(graph, expected) for i, (graph, expected) in enumerate(test_cases)}
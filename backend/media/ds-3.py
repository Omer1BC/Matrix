''''''
from typing import *
''''''
def has_cycle(graph: Dict[str, List[str]]) -> bool:
    """
    Detect if there is a cycle in the graph.
    
    Args:
        graph: dictionary where keys are nodes and values are lists of connected nodes
    
    Returns:
        bool: True if cycle exists, False otherwise
    """
    # User code will be inserted here
    pass
''''''
def run_test(graph, expected):
    exception = ""
    result = ""
    try:
        result = has_cycle(graph)
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
        {"A": ["B"], "B": ["C"], "C": ["A"]},
        True
    ),
    (
        {"A": ["B"], "B": ["C"], "C": []},
        False
    ),
    (
        {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []},
        False
    ),
    (
        {"A": ["B"], "B": ["C"], "C": ["D"], "D": ["A"]},
        True
    ),
    (
        {},
        False
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(graph, expected) for i, (graph, expected) in enumerate(test_cases)}
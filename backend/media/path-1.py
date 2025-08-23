''''''
from typing import *
''''''
def find_path(graph: Dict[str, List[str]], start: str, end: str, path: List[str] = None) -> Optional[List[str]]:
    """
    Find a path from start to end node in the graph.
    
    Args:
        graph: Dictionary representing the graph
        start: Starting node
        end: Target node
        path: Current path (for recursion)
    
    Returns:
        List[str]: Path as a list, or None if no path exists
    """
    if path is None:
        path = []
    # User code will be inserted here
    pass
''''''
def run_test(test_data, expected_has_path):
    exception = ""
    result = ""
    try:
        result = find_path(test_data["graph"], test_data["start"], test_data["end"])
        has_path = result is not None
        # Check if path is valid
        is_valid_path = False
        if result:
            is_valid_path = (result[0] == test_data["start"] and 
                           result[-1] == test_data["end"] and
                           all(result[i+1] in test_data["graph"].get(result[i], []) for i in range(len(result)-1)))
        
    except Exception as e:
        exception = str(e)
        has_path = False
        is_valid_path = False
    return {
        "test_data": test_data, 
        "expected_has_path": expected_has_path,
        "actual_path": result, 
        "error": exception,
        "passed": (has_path == expected_has_path and (not has_path or is_valid_path)) if not exception else False
    }

test_cases = [
    (
        {
            "graph": {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []},
            "start": "A",
            "end": "E"
        },
        True
    ),
    (
        {
            "graph": {"A": ["B"], "B": ["C"], "C": [], "D": ["E"], "E": []},
            "start": "A",
            "end": "E"
        },
        False
    ),
    (
        {
            "graph": {"A": ["B"], "B": ["A"]},
            "start": "A",
            "end": "A"
        },
        True
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(test_data, expected_has_path) for i, (test_data, expected_has_path) in enumerate(test_cases)}
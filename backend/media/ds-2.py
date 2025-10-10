''''''
from typing import *
''''''
def is_tree(edges: List[Tuple[str, str]]) -> bool:
    return False

''''''
def run_test(edges, expected):
    exception = ""
    result = ""
    try:
        result = is_tree(edges)

    except Exception as e:
        exception = str(e)
    return {
        "edges": edges,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    # Valid trees
    ([("A", "B"), ("B", "C"), ("C", "D")], True),  # Linear tree
    ([("A", "B"), ("A", "C"), ("A", "D")], True),  # Star tree
    ([("A", "B"), ("B", "C"), ("B", "D"), ("C", "E")], True),  # Branched tree
    ([], True),  # Empty graph is a tree
    ([("X", "Y")], True),  # Single edge

    # Invalid trees (cycles)
    ([("A", "B"), ("B", "C"), ("C", "A")], False),  # Triangle cycle
    ([("A", "B"), ("B", "C"), ("C", "D"), ("D", "A")], False),  # Square cycle
    ([("A", "B"), ("B", "C"), ("A", "C"), ("C", "D")], False),  # Tree with cycle

    # Invalid trees (disconnected)
    ([("A", "B"), ("C", "D")], False),  # Two separate edges
    ([("A", "B"), ("B", "C"), ("D", "E"), ("E", "F")], False),  # Two separate components

    # Invalid trees (too many edges)
    ([("A", "B"), ("B", "C"), ("C", "D"), ("D", "E"), ("E", "A"), ("A", "C")], False),  # More edges than needed
]

# Generate results without printing
results = {f"test_{i}": run_test(edge_data, expected) for i, (edge_data, expected) in enumerate(test_cases)}
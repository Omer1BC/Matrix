''''''
from typing import *
class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
''''''
def has_cycle(head):
    """
    Detect if there is a cycle in the linked list.
    Args:
        head: Node - head of the linked list
    Returns:
        bool: True if cycle exists, False otherwise
    """
    # Implement cycle detection using Floyd's algorithm
    # User code will be inserted here
    pass
''''''
def run_test(test_data, expected):
    exception = ""
    result = ""
    try:
        # Create linked list based on test data
        if not test_data["values"]:
            # Empty list case
            head = None
        else:
            # Create nodes
            nodes = []
            for val in test_data["values"]:
                nodes.append(Node(val))

            # Link nodes
            for i in range(len(nodes) - 1):
                nodes[i].next = nodes[i + 1]

            # Create cycle if specified
            if "cycle_pos" in test_data and test_data["cycle_pos"] is not None:
                cycle_pos = test_data["cycle_pos"]
                if cycle_pos < len(nodes):
                    nodes[-1].next = nodes[cycle_pos]

            head = nodes[0] if nodes else None

        # Test cycle detection
        result = has_cycle(head)

    except Exception as e:
        exception = str(e)
    return {
        "test_data": test_data,
        "expected": expected,
        "actual": result,
        "error": exception,
        "input":test_data["values"],
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        {"values": [1, 2, 3], "cycle_pos": 1},  # 1->2->3->2 (cycle back to position 1)
        True
    ),
    (
        {"values": [1, 2, 3], "cycle_pos": None},  # 1->2->3->None (no cycle)
        False
    ),
    (
        {"values": []},  # Empty list
        False
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(test_data, expected) for i, (test_data, expected) in enumerate(test_cases)}
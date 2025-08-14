''''''
from typing import *
''''''
class Edge:
    def __init__(self, from_node: str, to_node: str, weight: int = 1):
        """Initialize edge with from_node, to_node, and optional weight"""
        # User code will be inserted here
        pass
    
    def get_weight(self) -> int:
        """Return the weight of the edge"""
        # User code will be inserted here
        pass
    
    def get_nodes(self) -> Tuple[str, str]:
        """Return tuple of (from_node, to_node)"""
        # User code will be inserted here
        pass
''''''
def run_test(edge_data, expected):
    exception = ""
    result = ""
    try:
        edge = Edge(edge_data["from"], edge_data["to"], edge_data.get("weight", 1))
        nodes = edge.get_nodes()
        weight = edge.get_weight()
        result = {"nodes": nodes, "weight": weight}
        
    except Exception as e:
        exception = str(e)
    return {
        "edge_data": edge_data, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        {"from": "A", "to": "B", "weight": 5},
        {"nodes": ("A", "B"), "weight": 5}
    ),
    (
        {"from": "X", "to": "Y"},
        {"nodes": ("X", "Y"), "weight": 1}
    ),
    (
        {"from": "P", "to": "Q", "weight": 10},
        {"nodes": ("P", "Q"), "weight": 10}
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(edge_data, expected) for i, (edge_data, expected) in enumerate(test_cases)}
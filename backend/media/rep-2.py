''''''
from typing import *
''''''
class GraphMatrix:
    def __init__(self, num_vertices: int):
        """Initialize adjacency matrix with zeros"""
        # User code will be inserted here
        pass
    
    def add_vertex(self, vertex: str) -> bool:
        """Map vertex name to matrix index. Returns True if successful."""
        # User code will be inserted here
        pass
    
    def add_edge(self, v1: str, v2: str, weight: int = 1) -> bool:
        """Add edge with optional weight. Returns True if successful."""
        # User code will be inserted here
        pass
    
    def has_edge(self, v1: str, v2: str) -> bool:
        """Check if edge exists between v1 and v2"""
        # User code will be inserted here
        pass
    
    def get_matrix(self) -> List[List[int]]:
        """Return the adjacency matrix"""
        # User code will be inserted here
        pass
''''''
def run_test(operations, expected_edges):
    exception = ""
    result = ""
    try:
        g = GraphMatrix(4)  # Max 4 vertices for testing
        for op in operations:
            if op[0] == "add_vertex":
                g.add_vertex(op[1])
            elif op[0] == "add_edge":
                if len(op) == 4:
                    g.add_edge(op[1], op[2], op[3])
                else:
                    g.add_edge(op[1], op[2])
        
        # Check expected edges
        result = {}
        for edge in expected_edges:
            result[f"{edge[0]}-{edge[1]}"] = g.has_edge(edge[0], edge[1])
            
    except Exception as e:
        exception = str(e)
    return {
        "operations": operations, 
        "expected_edges": expected_edges,
        "actual": result, 
        "error": exception,
        "passed": all(result.values()) if not exception and result else False
    }

test_cases = [
    (
        [("add_vertex", "A"), ("add_vertex", "B"), ("add_vertex", "C"),
         ("add_edge", "A", "B", 5), ("add_edge", "B", "C", 3)],
        [("A", "B"), ("B", "C"), ("B", "A"), ("C", "B")]
    ),
    (
        [("add_vertex", "X"), ("add_vertex", "Y"), ("add_edge", "X", "Y")],
        [("X", "Y"), ("Y", "X")]
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(operations, expected_edges) for i, (operations, expected_edges) in enumerate(test_cases)}
from typing import *

class Graph:
    def __init__(self):
        """Initialize empty adjacency list"""
        # User code will be inserted here
        pass
    
    def add_vertex(self, vertex: str) -> None:
        """Add a vertex to the graph"""
        # User code will be inserted here
        pass
    
    def add_edge(self, v1: str, v2: str) -> None:
        """Add an edge between v1 and v2 (undirected)"""
        # User code will be inserted here
        pass
    
    def get_neighbors(self, vertex: str) -> List[str]:
        """Return list of neighbors for given vertex"""
        # User code will be inserted here
        pass
    
    def get_adjacency_list(self) -> Dict[str, List[str]]:
        """Return the adjacency list representation"""
        # User code will be inserted here
        pass

# Implement a Graph using Adjacency List

class Graph:
    def __init__(self):
        # Initialize empty adjacency list
        pass
    
    def add_vertex(self, vertex):
        # Add a vertex to the graph
        pass
    
    def add_edge(self, v1, v2):
        # Add an edge between v1 and v2 (undirected)
        pass
    
    def get_neighbors(self, vertex):
        # Return list of neighbors for given vertex
        pass
    
    def display(self):
        # Print the adjacency list representation
        pass


def run_test(operations, expected):
    exception = ""
    result = ""
    try:
        g = Graph()
        for op in operations:
            if op[0] == "add_vertex":
                g.add_vertex(op[1])
            elif op[0] == "add_edge":
                g.add_edge(op[1], op[2])
        
        result = g.get_adjacency_list()
    except Exception as e:
        exception = str(e)
    return {
        "operations": operations, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        [("add_vertex", "A"), ("add_vertex", "B"), ("add_vertex", "C"), 
         ("add_edge", "A", "B"), ("add_edge", "B", "C")],
        {"A": ["B"], "B": ["A", "C"], "C": ["B"]}
    ),
    (
        [("add_vertex", "X")],
        {"X": []}
    ),
    (
        [("add_vertex", "P"), ("add_vertex", "Q"), ("add_edge", "P", "Q")],
        {"P": ["Q"], "Q": ["P"]}
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(operations, expected) for i, (operations, expected) in enumerate(test_cases)}
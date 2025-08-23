from typing import *
from collections import deque

class GraphNode:
    def __init__(self, val: int):
        self.val = val
        self.neighbors = []

def bfs_layer_sums(start_node: Optional[GraphNode]) -> List[int]:
    """
    Perform BFS and return sum of values at each layer.
    
    Args:
        start_node: GraphNode - starting node for BFS
    
    Returns:
        list: sum of values at each layer [layer0_sum, layer1_sum, ...]
    """
    # User code will be inserted here
    pass

# BFS to calculate sum for each layer

from collections import deque

class GraphNode:
    def __init__(self, val):
        self.val = val
        self.neighbors = []

def bfs_layer_sums(start_node):
    """
    Perform BFS and return sum of values at each layer.
    Args:
        start_node: GraphNode - starting node for BFS
    Returns:
        list: sum of values at each layer [layer0_sum, layer1_sum, ...]
    """
    # Implement BFS with layer sum calculation
    pass


def run_test(graph_data, expected):
    exception = ""
    result = ""
    try:
        # Build graph from test data
        nodes = {}
        for node_info in graph_data["nodes"]:
            nodes[node_info["name"]] = GraphNode(node_info["val"])
        
        # Add connections
        for connection in graph_data["connections"]:
            nodes[connection[0]].neighbors.append(nodes[connection[1]])
        
        start_node = nodes[graph_data["start"]]
        result = bfs_layer_sums(start_node)
        
    except Exception as e:
        exception = str(e)
    return {
        "graph_data": graph_data, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (
        {
            "nodes": [
                {"name": "A", "val": 5},
                {"name": "B", "val": 3},
                {"name": "C", "val": 7},
                {"name": "D", "val": 2},
                {"name": "E", "val": 4}
            ],
            "connections": [("A", "B"), ("A", "C"), ("B", "D"), ("C", "E")],
            "start": "A"
        },
        [5, 10, 6]
    ),
    (
        {
            "nodes": [{"name": "X", "val": 10}],
            "connections": [],
            "start": "X"
        },
        [10]
    ),
    (
        {
            "nodes": [
                {"name": "P", "val": 1},
                {"name": "Q", "val": 2},
                {"name": "R", "val": 3}
            ],
            "connections": [("P", "Q"), ("Q", "R")],
            "start": "P"
        },
        [1, 2, 3]
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(graph_data, expected) for i, (graph_data, expected) in enumerate(test_cases)}
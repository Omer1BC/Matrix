from typing import *

class Node:
    def __init__(self, value: str):
        """Initialize node with a value and empty connections list"""
        # User code will be inserted here
        pass
    
    def add_connection(self, node: 'Node') -> None:
        """Add a connection to another node"""
        # User code will be inserted here
        pass
    
    def get_connections(self) -> List['Node']:
        """Return list of connected nodes"""
        # User code will be inserted here
        pass

# Create a Node class for graph representation

class Node:
    def __init__(self, value):
        # Initialize node with a value and empty connections list
        pass
    
    def add_connection(self, node):
        # Add a connection to another node
        pass
    
    def get_connections(self):
        # Return list of connected nodes
        pass


def run_test(test_data, expected):
    exception = ""
    result = ""
    try:
        nodes = {}
        # Create nodes
        for node_name in test_data["nodes"]:
            nodes[node_name] = Node(node_name)
        
        # Create connections
        for connection in test_data["connections"]:
            nodes[connection[0]].add_connection(nodes[connection[1]])
        
        # Test the connections
        test_node = nodes[test_data["test_node"]]
        connected_values = [n.value for n in test_node.get_connections()]
        result = connected_values
        
    except Exception as e:
        exception = str(e)
    return {
        "test_data": test_data, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": sorted(result) == sorted(expected) if not exception else False
    }

test_cases = [
    (
        {"nodes": ["A", "B", "C"], "connections": [("A", "B"), ("A", "C")], "test_node": "A"},
        ["B", "C"]
    ),
    (
        {"nodes": ["X", "Y"], "connections": [("X", "Y")], "test_node": "X"},
        ["Y"]
    ),
    (
        {"nodes": ["P"], "connections": [], "test_node": "P"},
        []
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(test_data, expected) for i, (test_data, expected) in enumerate(test_cases)}
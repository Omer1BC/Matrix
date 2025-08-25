from typing import *

def compute_graph_sum(graph: Dict[str, Dict]) -> int:
    """
    Compute the sum of all node values in a graph.
    
    Args:
        graph: Dictionary representing the graph where keys are node names
               and values are dictionaries containing 'value' and 'connections'
    
    Returns:
        int: Sum of all node values in the graph
    """
    # User code will be inserted here
    pass

# Write a program that computes the sum of all node values in a graph
# The graph is represented as a dictionary where keys are node names
# and values are dictionaries containing 'value' and 'connections'
#
# Example graph structure:
# graph = {
#     'A': {'value': 5, 'connections': ['B', 'C']},
#     'B': {'value': 3, 'connections': ['A', 'D']},
#     'C': {'value': 7, 'connections': ['A']},
#     'D': {'value': 2, 'connections': ['B']}
# }

def compute_graph_sum(graph):
    return sum(node_data['value'] for node_data in graph.values())
    pass
def run_test(graph, expected):
    exception = ""
    result = ""
    try:
        result = compute_graph_sum(graph)
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
        {'A': {'value': 5, 'connections': ['B', 'C']}, 
         'B': {'value': 3, 'connections': ['A', 'D']}, 
         'C': {'value': 7, 'connections': ['A']}, 
         'D': {'value': 2, 'connections': ['B']}}, 
        17
    ),
    (
        {'X': {'value': 10, 'connections': []}}, 
        10
    ),
    (
        {'A': {'value': 1, 'connections': ['B']}, 
         'B': {'value': 2, 'connections': ['C']}, 
         'C': {'value': 3, 'connections': []}}, 
        6
    ),
    (
        {'P': {'value': -5, 'connections': ['Q']}, 
         'Q': {'value': 15, 'connections': ['P']}}, 
        10
    ),
    (
        {}, 
        0
    )
]

# Generate results without printing
results = {f"test_{i}": run_test(graph, expected) for i, (graph, expected) in enumerate(test_cases)}

# Only store results, don't print them
# The Django endpoint will extract these results from the namespace
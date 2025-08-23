from typing import *

def twoSum(nums:List[int],target:int)->int:
    hm = {}
    for i,n in enumerate(nums):
        if target - n in hm:
            return [hm[target-n],i]
        else:
            hm[n]=i 
    return []

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


def run_test(nums, target, expected):
    exception = ""
    result = ""
    try:
        result = countComponents(n, edges)
        
    except Exception as e:
        exception = str(e)
    return {"n": n, 
          "edges": edges, 
          "expected": expected,
          "actual": result, 
        #   
        }
test_cases = [
    (5, [[0,1],[1,2],[3,4]], 2),
    (5, [[0,1],[1,2],[2,3],[3,4]], 1),
    (3, [], 3),
]
results = { f"{i}": run_test(n, edges, expected) for i, (n, edges, expected) in enumerate(test_cases)}
print(results)
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
        result = (twoSum(nums, target))
        
    except Exception as e:
        exception = str(e)
    return {"target": target, 
          "nums": nums, 
          "expected": sorted(expected),
          "actual": result, 
          "error": exception}
test_cases = [
    ([2, 7, 11, 15], 9, [0, 1]),
    ([3, 2, 4], 6, [1, 2]),
    ([3, 3], 6, [0, 1]),
]
results = { f"{i}": run_test(nums, target, expected) for i, (nums, target, expected) in enumerate(test_cases)}
print(results)
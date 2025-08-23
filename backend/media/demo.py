from typing import *

def twoSum(nums:List[int],target:int)->int:
    hm = {}
    for i,n in enumerate(nums):
        if target - n in hm:
            return [hm[target-n],i]
        else:
            hm[n]=i 
    return []

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
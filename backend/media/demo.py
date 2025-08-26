from typing import *

def countComponents(n: int, edges: List[List[int]]) -> int:
    graph = {i: [] for i in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    visited = set()
    components = 0
    
    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph[node]:
            dfs(neighbor)
    
    for i in range(n):
        if i not in visited:
            dfs(i)
            components += 1
    
    return components

def twoSum(self, nums: List[int], target: int) -> List[int]:
        return []
def run_test(n, edges, expected):
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
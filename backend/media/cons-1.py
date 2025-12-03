''''''
from typing import *
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right
''''''
def height(root):
    if root is None:
        return -1
    return 1 + max(height(root.left), height(root.right))

def count_nodes(root):
    if root is None:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)

def efficency(root):
    return count_nodes(root) - height(root)

''''''
def build_tree(bfs_list):
    if not bfs_list or bfs_list[0] is None:
        return None

    root = Node(bfs_list[0])
    queue = [root]
    i = 1

    while queue and i < len(bfs_list):
        current = queue.pop(0)

        if i < len(bfs_list) and bfs_list[i] is not None:
            current.left = Node(bfs_list[i])
            queue.append(current.left)
        i += 1

        if i < len(bfs_list) and bfs_list[i] is not None:
            current.right = Node(bfs_list[i])
            queue.append(current.right)
        i += 1

    return root


def run_test(input, expected):
    bfs_list = input
    exception = ""
    result = None
    try:
        root = build_tree(bfs_list)
        result = efficency(root)
    except Exception as e:
        exception = str(e)
    return {
        "input": input,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }



test_cases = [
    ([10], 1),
    ([10, 5, 15], 2),
    ([10, 5, 15, 3, 7, 12, 20], 5),
    ([10, 5, None, 3, None, 1], 1),
    ([10, None, 15, None, 20, None, 25], 1),
    ([10, 5], 1),
    ([10, None, 15], 1),
    ([50, 30, 70, 20, 40, 60, 80], 5),
    ([5, 3, 7, 1, 4, 6, 9], 5),
    ([], 1)
]

results = {f"test_{i}": run_test(input, expected) for i, (input, expected) in enumerate(test_cases)}





''''''
from typing import *
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right
''''''
def find_max(root: Node) -> Node:
    if root is None:
        return None

    while root.right is not None:
        root = root.right

    return root

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
    result_node = None
    result_value = None
    try:
        root = build_tree(bfs_list)
        result_node = find_max(root)
        result_value = result_node.val if result_node else None
    except Exception as e:
        exception = str(e)
    return {
        "input": input,
        "expected": expected,
        "actual": result_value,
        "error": exception,
        "passed": result_value == expected if not exception else False
    }



test_cases = [
    ([10], 10),
    ([10, 5, 15], 15),
    ([10, 5, 15, 3, 7, 12, 20], 20),
    ([10, 5, None, 3, None, 1], 10),
    ([10, None, 15, None, 20, None, 25], 25),
    ([10, 5], 10),
    ([10, None, 15], 15),
    ([50, 30, 70, 20, 40, 60, 80], 80),
]

results = {f"test_{i}": run_test(input, expected) for i, (input, expected) in enumerate(test_cases)}




''''''
from typing import *
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right
''''''
def insert(root:Node, val:int) -> Node:
    if root is None:
        return Node(val)

    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)

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


def tree_to_bfs(root):
    if not root:
        return []

    result = []
    queue = [root]

    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)

    while result and result[-1] is None:
        result.pop()

    return result


def run_test(input, expected):
    bfs_list,value_to_insert = input
    exception = ""
    result = []
    try:
        root = build_tree(bfs_list)
        root = insert(root, value_to_insert)
        result = tree_to_bfs(root)
    except Exception as e:
        exception = str(e)
    return {
        "input": input,
        "value_to_insert": value_to_insert,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }



test_cases = [
    (([10], 5), [10, 5]),
    (([10], 15), [10, None, 15]),
    (([5, 3, 7], 6), [5, 3, 7, None, None, 6]),
    (([10, 5, 15, None, 7], 1), [10, 5, 15, 1, 7]),
    (([10, 5, 15, 3, 7, 12], 25), [10, 5, 15, 3, 7, 12, 25]),
    (([10, 8, None, 6, None, 4], 2), [10, 8, None, 6, None, 4, None, 2]),
    (([2, None, 4, None, 6, None, 8], 10), [2, None, 4, None, 6, None, 8, None, 10])
]

results = {f"test_{i}": run_test(input, expected) for i, (input, expected) in enumerate(test_cases)}


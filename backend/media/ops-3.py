""""""

from typing import *


class Node:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


""""""


def remove_max(root):
    if root is None:
        return None

    if root.right is None:
        return root.left

    root.right = remove_max(root.right)
    return root


""""""


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
    bfs_list = input
    exception = ""
    result = []
    try:
        root = build_tree(bfs_list)
        root = remove_max(root)
        result = tree_to_bfs(root)
    except Exception as e:
        exception = str(e)
    return {
        "input": input,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False,
    }


test_cases = [
    ([10], []),
    ([10, 5], [5]),
    ([10, None, 15], [10]),
    ([10, 5, 15], [10, 5]),
    ([10, 5, 15, 3, 7, 12, 20], [10, 5, 15, 3, 7, 12]),
    ([10, 5, None, 3, None, 1], [5, 3, None, 1]),
    ([10, None, 15, None, 20, None, 25], [10, None, 15, None, 20]),
    ([50, 30, 70, 20, 40, 60, 80], [50, 30, 70, 20, 40, 60]),
    ([5, 3, 7, 1, 4, 6, 9], [5, 3, 7, 1, 4, 6]),
]

results = {
    f"test_{i}": run_test(input, expected)
    for i, (input, expected) in enumerate(test_cases)
}

""""""

from typing import *


class Node:
    def init(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


""""""


def decreasing_order(root):
    if root is None:
        return []

    return decreasing_order(root.right) + [root.val] + decreasing_order(root.left)


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


def run_test(input, expected):
    bfs_list = input
    exception = ""
    result = []
    try:
        root = build_tree(bfs_list)
        result = decreasing_order(root)
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
    ([10], [10]),
    ([10, 5, 15], [15, 10, 5]),
    ([10, 5, 15, 3, 7, 12, 20], [20, 15, 12, 10, 7, 5, 3]),
    ([10, 5, None, 3, None, 1], [10, 5, 3, 1]),
    ([10, None, 15, None, 20, None, 25], [25, 20, 15, 10]),
    ([10, 5], [10, 5]),
    ([10, None, 15], [15, 10]),
    ([50, 30, 70, 20, 40, 60, 80], [80, 70, 60, 50, 40, 30, 20]),
    ([5, 3, 7, 1, 4, 6, 9], [9, 7, 6, 5, 4, 3, 1]),
    ([], []),
]

results = {
    f"test{i}": run_test(input, expected)
    for i, (input, expected) in enumerate(test_cases)
}

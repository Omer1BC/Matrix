from typing import *
<<<<<<< HEAD
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right

def decreasing_order(root):
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
=======

def binary_search(arr, target):
    """
    Perform binary search on a sorted array to find the target value.
    Args:
        arr: List[int] - a sorted list of integers
        target: int - the value to search for
    Returns:
        int - index of target if found, -1 otherwise
    """
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
def run_test(test_input, expected):
    exception = ""
    result = ""
    try:
        arr, target = test_input
        result = binary_search(arr, target)
    except Exception as e:
        exception = str(e)
    return {
        "input": test_input,
>>>>>>> 9bb1b2f40aee193b5b8e820d3e4ba4797717cd6f
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }



test_cases = [
<<<<<<< HEAD
    ([10], [10]),
    ([10, 5, 15], [15, 10, 5]),
    ([10, 5, 15, 3, 7, 12, 20], [20, 15, 12, 10, 7, 5, 3]),
    ([10, 5, None, 3, None, 1], [10, 5, 3, 1]),
    ([10, None, 15, None, 20, None, 25], [25, 20, 15, 10]),
    ([10, 5], [10, 5]),
    ([10, None, 15], [15, 10]),
    ([50, 30, 70, 20, 40, 60, 80], [80, 70, 60, 50, 40, 30, 20]),
    ([5, 3, 7, 1, 4, 6, 9], [9, 7, 6, 5, 4, 3, 1]),
    ([], [])
]

results = {f"test_{i}": run_test(input, expected) for i, (input, expected) in enumerate(test_cases)}


=======
    (([1, 2, 3, 4, 5, 6, 7], 4), 3),
    (([1, 2, 3, 4, 5], 1), 0),
    (([1, 2, 3, 4, 5], 5), 4),
    (([1, 2, 3, 4, 5], 6), -1),
    (([], 1), -1),
    (([10], 10), 0),
    (([1, 3, 5, 7, 9, 11], 7), 3)
]

results = {f"test_{i}": run_test(test_input, expected) for i, (test_input, expected) in enumerate(test_cases)}
>>>>>>> 9bb1b2f40aee193b5b8e820d3e4ba4797717cd6f

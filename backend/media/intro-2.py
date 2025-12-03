''''''
from typing import *
''''''
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

''''''
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
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }



test_cases = [
    (([1, 2, 3, 4, 5, 6, 7], 4), 3),
    (([1, 2, 3, 4, 5], 1), 0),
    (([1, 2, 3, 4, 5], 5), 4),
    (([1, 2, 3, 4, 5], 6), -1),
    (([], 1), -1),
    (([10], 10), 0),
    (([1, 3, 5, 7, 9, 11], 7), 3)
]

results = {f"test_{i}": run_test(test_input, expected) for i, (test_input, expected) in enumerate(test_cases)}

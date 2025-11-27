from typing import *

def binary_search(arr, target):

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

''''''
from typing import *
''''''
def is_even(number: int) -> bool:
    """
    Check if a number is even.
    
    Args:
        number: Integer to check
    
    Returns:
        bool: True if even, False if odd
    """
    # User code will be inserted here
    pass
''''''
def run_test(number, expected):
    exception = ""
    result = ""
    try:
        result = is_even(number)
    except Exception as e:
        exception = str(e)
    return {
        "number": number, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (4, True),
    (7, False),
    (0, True),
    (-2, True),
    (-3, False),
    (100, True),
    (101, False)
]

# Generate results without printing
results = {f"test_{i}": run_test(number, expected) for i, (number, expected) in enumerate(test_cases)}
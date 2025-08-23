''''''
from typing import *
''''''
def is_prime(n: int) -> bool:
    """
    Check if a number is prime.
    
    Args:
        n: Integer to check for primality
    
    Returns:
        bool: True if prime, False otherwise
    """
    # User code will be inserted here
    pass
''''''
def run_test(n, expected):
    exception = ""
    result = ""
    try:
        result = is_prime(n)
    except Exception as e:
        exception = str(e)
    return {
        "n": n, 
        "expected": expected,
        "actual": result, 
        "error": exception,
        "passed": result == expected if not exception else False
    }

test_cases = [
    (17, True),
    (25, False),
    (2, True),
    (1, False),
    (0, False),
    (-5, False),
    (29, True),
    (4, False),
    (13, True),
    (9, False)
]

# Generate results without printing
results = {f"test_{i}": run_test(n, expected) for i, (n, expected) in enumerate(test_cases)}
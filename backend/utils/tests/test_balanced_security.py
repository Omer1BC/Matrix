#!/usr/bin/env python3
"""
Test that the balanced security approach works:
- Legitimate user code runs successfully
- Malicious user code is blocked
- Template imports are allowed
"""

import sys
import os

# Add backend directory to path (go up 2 levels: tests -> utils -> backend)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from utils.security import SafeExecutor


def test(name, template, user_code, should_pass):
    """Test security with template + user code."""
    print(f"\n{'='*70}")
    print(f"Test: {name}")
    print(f"{'='*70}")

    # Simulate what insert_user_code does
    full_code = template + "\n\n" + user_code

    print(f"\nTemplate (trusted):\n{template}")
    print(f"\nUser Code (checking for exploits):\n{user_code}")

    executor = SafeExecutor()
    result = executor.execute_with_template(
        full_code=full_code,
        user_code=user_code,
        timeout=5
    )

    print(f"\nResult:")
    if result['success']:
        print(f"✅ ALLOWED")
        print(f"Output: {result['output'][:200]}")
    else:
        print(f"❌ BLOCKED")
        print(f"Reason: {result['error']}")
        if result.get('violations'):
            for v in result['violations']:
                print(f"  - {v}")

    # Verify expectation
    if result['success'] == should_pass:
        print(f"\n✅ TEST PASSED")
    else:
        print(f"\n❌ TEST FAILED (Expected {'pass' if should_pass else 'block'})")

    return result['success'] == should_pass


print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║           BALANCED SECURITY TEST                                 ║
║           Template imports allowed, user exploits blocked        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
""")

results = []

# Test 1: Legitimate solution
template_1 = """
from typing import List
import subprocess

def run_test(func, nums, target, expected):
    result = func(nums, target)
    return result == expected
"""

user_code_1 = """
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test it
result = two_sum([2, 7, 11, 15], 9)
print(f"Result: {result}")
"""

results.append(test("Legitimate Solution", template_1, user_code_1, should_pass=True))

# Test 2: User tries to import os
template_2 = """
from typing import List

def run_test(func, nums):
    return func(nums)
"""

user_code_2 = """
import os

def solution(nums):
    # Try to steal environment variables
    return os.environ.get("OPENAI_API_KEY", "not found")

print(solution([1, 2, 3]))
"""

results.append(test("User Import Exploit", template_2, user_code_2, should_pass=False))

# Test 3: User tries infinite loop
template_3 = """
from typing import List

def run_test(func):
    return func()
"""

user_code_3 = """
def solution():
    while True:
        pass
    return "never"

solution()
"""

results.append(test("Infinite Loop Attack", template_3, user_code_3, should_pass=False))

# Test 4: User uses eval
template_4 = """
from typing import List

def run_test(func, s):
    return func(s)
"""

user_code_4 = """
def solution(s):
    return eval(s)  # Dangerous!

print(solution("2 + 2"))
"""

results.append(test("Eval() Exploit", template_4, user_code_4, should_pass=False))

# Test 5: Legitimate recursive solution
template_5 = """
def run_test(func, n):
    return func(n)
"""

user_code_5 = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")
"""

results.append(test("Legitimate Recursion", template_5, user_code_5, should_pass=True))

# Summary
print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}\n")

passed = sum(results)
total = len(results)

print(f"Tests passed: {passed}/{total}")
print()

if passed == total:
    print("✅ ALL TESTS PASSED!")
    print()
    print("Security is balanced:")
    print("  ✅ Template imports work (subprocess, typing, etc.)")
    print("  ✅ Legitimate user code executes normally")
    print("  ❌ User exploits are blocked (imports, eval, infinite loops)")
else:
    print("❌ SOME TESTS FAILED")
    print("Review the output above for details")

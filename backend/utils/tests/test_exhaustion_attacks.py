#!/usr/bin/env python3
"""
Examples of Resource Exhaustion Attacks in Python

This demonstrates various techniques attackers might use to:
- Consume unlimited CPU time
- Exhaust memory
- Hang the server
- Cause denial of service

Run from backend directory: python3 test_exhaustion_attacks.py
"""

import sys
import os

# Add backend directory to path (go up 2 levels: tests -> utils -> backend)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from utils.security import SafeExecutor


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def test_attack(name, code, description):
    """Test a resource exhaustion attack."""
    print(f"\n{Colors.BOLD}{Colors.YELLOW}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}Attack: {name}{Colors.RESET}")
    print(f"Description: {description}")
    print(f"{Colors.BOLD}{Colors.YELLOW}{'='*70}{Colors.RESET}")

    print(f"\n{Colors.BLUE}Code:{Colors.RESET}")
    print(code)

    executor = SafeExecutor(enable_timeout=True)
    result = executor.execute(code, "", timeout=3, allow_imports=False)

    print(f"\n{Colors.BOLD}Result:{Colors.RESET}")
    if result['success']:
        print(f"{Colors.RED}❌ DANGEROUS - Attack succeeded!{Colors.RESET}")
        print(f"Output: {result['output'][:200]}")
    else:
        print(f"{Colors.GREEN}✓ BLOCKED - System is safe!{Colors.RESET}")
        print(f"Blocked because: {result['error']}")
        if result.get('violations'):
            print(f"Violations detected:")
            for v in result['violations']:
                print(f"  - {v}")


def main():
    print(f"\n{Colors.BOLD}{Colors.RED}{'='*70}")
    print("RESOURCE EXHAUSTION ATTACK EXAMPLES")
    print(f"{'='*70}{Colors.RESET}\n")

    # ============================================================================
    # 1. SIMPLE INFINITE LOOP
    # ============================================================================
    test_attack(
        "Simple Infinite Loop",
        '''
def solution():
    while True:
        pass  # Never exits, consumes 100% CPU on one core

solution()
''',
        "Basic infinite loop that never terminates. Would hang the server forever."
    )

    # ============================================================================
    # 2. BUSY WAIT WITH COMPUTATION
    # ============================================================================
    test_attack(
        "Computational Infinite Loop",
        '''
def solution():
    x = 0
    while True:
        x = x * 2 + 1  # Constantly computing, burns CPU
        x = x % 1000000  # Keep number manageable but still loop forever

solution()
''',
        "Infinite loop doing actual computation. Harder to detect, burns CPU."
    )

    # ============================================================================
    # 3. RECURSIVE INFINITE LOOP
    # ============================================================================
    test_attack(
        "Infinite Recursion",
        '''
def solution():
    return solution()  # Calls itself infinitely

solution()
''',
        "Recursive function with no base case. Would cause stack overflow."
    )

    # ============================================================================
    # 4. NESTED INFINITE LOOPS
    # ============================================================================
    test_attack(
        "Nested Infinite Loops",
        '''
def solution():
    while True:
        while True:
            while True:
                x = 1 + 1  # Nested infinity, extra CPU intensive

solution()
''',
        "Multiple nested infinite loops. Extremely CPU intensive."
    )

    # ============================================================================
    # 5. MEMORY EXHAUSTION
    # ============================================================================
    test_attack(
        "Memory Bomb",
        '''
def solution():
    data = []
    while True:
        # Appends 1MB per iteration
        data.append("A" * 1000000)

solution()
''',
        "Allocates memory infinitely until system runs out of RAM."
    )

    # ============================================================================
    # 6. EXPONENTIAL MEMORY GROWTH
    # ============================================================================
    test_attack(
        "Exponential Memory Bomb",
        '''
def solution():
    data = "x"
    while True:
        data = data + data  # Doubles size each iteration (exponential!)

solution()
''',
        "Exponentially growing data structure. Crashes system very quickly."
    )

    # ============================================================================
    # 7. FIBONACCI BOMB (CPU)
    # ============================================================================
    test_attack(
        "Fibonacci Bomb",
        '''
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

def solution():
    # fib(100) without memoization = catastrophic computation
    return fib(100)

solution()
''',
        "Exponential time complexity O(2^n). Would take billions of years."
    )

    # ============================================================================
    # 8. FORK BOMB (if subprocess was allowed)
    # ============================================================================
    test_attack(
        "Fork Bomb Attempt",
        '''
import subprocess
import os

def solution():
    while True:
        # Classic fork bomb: creates processes exponentially
        os.fork()

solution()
''',
        "Fork bomb - would exponentially spawn processes. Crashes entire system."
    )

    # ============================================================================
    # 9. STRING CATASTROPHIC BACKTRACKING
    # ============================================================================
    test_attack(
        "Regex Denial of Service (ReDoS)",
        '''
import re

def solution():
    # Catastrophic backtracking pattern
    pattern = r"(a+)+"
    text = "a" * 30 + "b"
    # This would take exponential time
    re.match(pattern, text)

solution()
''',
        "ReDoS attack using regex with catastrophic backtracking."
    )

    # ============================================================================
    # 10. LARGE NUMBER COMPUTATION
    # ============================================================================
    test_attack(
        "Factorial Bomb",
        '''
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

def solution():
    # Computing factorial of huge number
    return factorial(100000)

solution()
''',
        "Computing factorial of massive number. Result would have millions of digits."
    )

    # ============================================================================
    # 11. ZIP BOMB (if file ops were allowed)
    # ============================================================================
    test_attack(
        "Zip Bomb Attempt",
        '''
import zipfile

def solution():
    # Create deeply nested zip files
    with open('bomb.zip', 'wb') as f:
        for i in range(1000000):
            f.write(b'0' * 1000000)

solution()
''',
        "Creates massively compressed file that expands to fill all disk space."
    )

    # ============================================================================
    # 12. BILLION LAUGHS ATTACK (XML)
    # ============================================================================
    test_attack(
        "Billion Laughs Attack",
        '''
import xml.etree.ElementTree as ET

xml = """<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
]>
<lolz>&lol3;</lolz>"""

def solution():
    ET.fromstring(xml)

solution()
''',
        "XML entity expansion attack. Small XML expands to gigabytes in memory."
    )

    # ============================================================================
    # SUMMARY
    # ============================================================================
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}{Colors.RESET}\n")

    print(f"{Colors.BOLD}Attack Categories:{Colors.RESET}")
    print(f"1. {Colors.YELLOW}CPU Exhaustion{Colors.RESET} - Infinite loops, exponential algorithms")
    print(f"2. {Colors.YELLOW}Memory Exhaustion{Colors.RESET} - Memory bombs, exponential growth")
    print(f"3. {Colors.YELLOW}Stack Exhaustion{Colors.RESET} - Infinite recursion")
    print(f"4. {Colors.YELLOW}Process Exhaustion{Colors.RESET} - Fork bombs")
    print(f"5. {Colors.YELLOW}Disk Exhaustion{Colors.RESET} - Zip bombs")
    print()

    print(f"{Colors.BOLD}How Our Security Stops These:{Colors.RESET}")
    print(f"✓ {Colors.GREEN}Timeout (10s){Colors.RESET} - Kills infinite loops and slow algorithms")
    print(f"✓ {Colors.GREEN}Import blocking{Colors.RESET} - Prevents subprocess, zipfile, xml attacks")
    print(f"✓ {Colors.GREEN}Restricted builtins{Colors.RESET} - No file I/O, no system access")
    print(f"✓ {Colors.GREEN}Isolated namespace{Colors.RESET} - Cannot affect server state")
    print()

    print(f"{Colors.BOLD}Without Protection:{Colors.RESET}")
    print(f"  ❌ Server would hang/crash")
    print(f"  ❌ Other users denied service")
    print(f"  ❌ System resources exhausted")
    print(f"  ❌ Potential system crash")
    print()

    print(f"{Colors.BOLD}With Our Protection:{Colors.RESET}")
    print(f"  {Colors.GREEN}✓ Attacks detected and blocked{Colors.RESET}")
    print(f"  {Colors.GREEN}✓ User gets clear error message{Colors.RESET}")
    print(f"  {Colors.GREEN}✓ Server remains stable{Colors.RESET}")
    print(f"  {Colors.GREEN}✓ Other users unaffected{Colors.RESET}")
    print()


if __name__ == "__main__":
    main()

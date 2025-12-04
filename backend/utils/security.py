"""
Security sandbox for safely executing user-submitted Python code.

This module provides multiple layers of security:
1. AST-based static analysis to detect dangerous patterns
2. Import blocking/whitelisting
3. Restricted builtins to prevent file system and OS access
4. Execution timeouts to prevent infinite loops
5. Exception handling for runtime errors

Usage:
    from utils.security import SafeExecutor

    executor = SafeExecutor()
    result = executor.execute(user_code, test_code, timeout=5)
"""

import ast
import sys
import io
import signal
import traceback
import threading
from typing import Dict, Any, Optional, Set, List
from contextlib import contextmanager


class SecurityError(Exception):
    """Raised when code contains security violations."""
    pass


class TimeoutError(Exception):
    """Raised when code execution exceeds timeout."""
    pass


class CodeAnalyzer(ast.NodeVisitor):
    """
    AST visitor that analyzes code for security vulnerabilities.

    Detects:
    - Import statements (all imports are blocked by default)
    - Dangerous built-in function calls
    - Attribute access to dangerous modules
    - Eval/exec usage
    - File operations
    """

    def __init__(self):
        self.violations: List[str] = []
        self.imports: Set[str] = set()
        self.dangerous_calls: Set[str] = set()

    def visit_Import(self, node: ast.Import) -> None:
        """Detect import statements."""
        for alias in node.names:
            self.imports.add(alias.name)
            self.violations.append(
                f"Line {node.lineno}: Import statement detected: 'import {alias.name}'"
            )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Detect from...import statements."""
        module = node.module or ""
        for alias in node.names:
            import_path = f"{module}.{alias.name}" if module else alias.name
            self.imports.add(import_path)
            self.violations.append(
                f"Line {node.lineno}: Import statement detected: 'from {module} import {alias.name}'"
            )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        """Detect dangerous function calls."""
        # Check for dangerous built-in functions
        dangerous_builtins = {
            'eval', 'exec', 'compile', '__import__',
            'open', 'input', 'breakpoint', 'exit', 'quit',
            'vars', 'locals', 'globals', 'dir',
            'getattr', 'setattr', 'delattr', 'hasattr'
        }

        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in dangerous_builtins:
                self.dangerous_calls.add(func_name)
                self.violations.append(
                    f"Line {node.lineno}: Dangerous function call detected: '{func_name}()'"
                )

        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute) -> None:
        """Detect dangerous attribute access."""
        # Detect patterns like os.environ, os.system, etc.
        dangerous_patterns = [
            ('os', 'environ'),
            ('os', 'system'),
            ('os', 'popen'),
            ('subprocess', 'run'),
            ('subprocess', 'call'),
            ('subprocess', 'Popen'),
            ('sys', 'modules'),
        ]

        if isinstance(node.value, ast.Name):
            for module, attr in dangerous_patterns:
                if node.value.id == module and node.attr == attr:
                    self.violations.append(
                        f"Line {node.lineno}: Dangerous attribute access: '{module}.{attr}'"
                    )

        self.generic_visit(node)


def analyze_code_security(code: str) -> tuple[bool, List[str]]:
    """
    Analyze code for security vulnerabilities using AST parsing.

    Args:
        code: Python source code to analyze

    Returns:
        Tuple of (is_safe, violations_list)
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        # Syntax errors will be caught during compilation, not a security issue
        return True, []

    analyzer = CodeAnalyzer()
    analyzer.visit(tree)

    is_safe = len(analyzer.violations) == 0
    return is_safe, analyzer.violations


def create_safe_builtins() -> Dict[str, Any]:
    """
    Create a restricted set of built-in functions.

    Removes dangerous functions like:
    - open, input (I/O operations)
    - eval, exec, compile, __import__ (code execution)
    - vars, globals, locals, dir (introspection)
    - exit, quit (program control)

    Keeps safe functions like:
    - print, len, range, enumerate, zip
    - int, str, float, bool, list, dict, set, tuple
    - min, max, sum, abs, round
    - all, any, sorted, reversed
    """
    # Start with all builtins
    safe_builtins = {}

    # Whitelist of safe built-in functions
    safe_names = {
        # Type constructors
        'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple',
        'frozenset', 'complex', 'bytes', 'bytearray',

        # Common functions
        'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter',
        'abs', 'round', 'min', 'max', 'sum', 'pow',
        'all', 'any', 'sorted', 'reversed',

        # String/iteration
        'chr', 'ord', 'hex', 'bin', 'oct', 'ascii',
        'iter', 'next', 'slice',

        # Type checking
        'isinstance', 'issubclass', 'type',

        # Object operations (limited)
        'id', 'hash', 'repr', 'str',

        # Exceptions
        'Exception', 'ValueError', 'TypeError', 'KeyError',
        'IndexError', 'AttributeError', 'RuntimeError',
        'StopIteration', 'ZeroDivisionError',

        # Other safe utilities
        'divmod', 'callable',
    }

    # Copy only safe builtins
    import builtins
    for name in safe_names:
        if hasattr(builtins, name):
            safe_builtins[name] = getattr(builtins, name)

    # Add True, False, None
    safe_builtins['True'] = True
    safe_builtins['False'] = False
    safe_builtins['None'] = None

    return safe_builtins


def is_main_thread():
    """Check if we're running in the main thread."""
    return threading.current_thread() == threading.main_thread()


@contextmanager
def timeout_context(seconds: int):
    """
    Context manager for execution timeout.

    Args:
        seconds: Maximum execution time in seconds

    Raises:
        TimeoutError: If execution exceeds timeout

    Note:
        Signals only work in the main thread. In Django/Flask request handlers
        (which run in worker threads), this will skip timeout enforcement.
    """
    # Check if signals are available and we're in the main thread
    can_use_signals = hasattr(signal, 'SIGALRM') and is_main_thread()

    if not can_use_signals:
        # Can't use signals (Windows or not main thread), just execute without timeout
        yield
        return

    def timeout_handler(signum, frame):
        raise TimeoutError(f"Code execution exceeded {seconds} second timeout")

    # Set up the timeout
    old_handler = signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)

    try:
        yield
    finally:
        # Restore previous handler and cancel alarm
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)


class SafeExecutor:
    """
    Safely execute user-submitted Python code with multiple security layers.

    Example:
        executor = SafeExecutor()
        result = executor.execute(
            user_code="def solution(nums): return sum(nums)",
            test_code="print(solution([1,2,3]))",
            timeout=5
        )

        if result['success']:
            print(result['output'])
        else:
            print(result['error'])
    """

    def __init__(self, enable_timeout: bool = True):
        """
        Initialize the safe executor.

        Args:
            enable_timeout: Whether to enforce execution timeouts (default: True)
                           Set to False on Windows or environments without signal support
        """
        self.enable_timeout = enable_timeout
        self.safe_builtins = create_safe_builtins()

    def execute(
        self,
        user_code: str,
        test_code: str = "",
        timeout: int = 5,
        allow_imports: bool = False,
        check_user_code_only: bool = False
    ) -> Dict[str, Any]:
        """
        Execute user code with security restrictions.

        Args:
            user_code: The user's solution code (or full code to execute if check_user_code_only=False)
            test_code: Test code to run (optional)
            timeout: Maximum execution time in seconds (default: 5)
            allow_imports: Whether to allow import statements (default: False)
            check_user_code_only: If True, only analyze user_code for violations but execute it as-is.
                                  Use this when user_code contains trusted template + untrusted user code.

        Returns:
            Dictionary with keys:
            - success: bool - Whether execution succeeded
            - output: str - Captured stdout
            - error: str - Error message if failed
            - violations: List[str] - Security violations detected
        """
        # Step 1: Static analysis
        # Note: When using templates, the full code will have imports from the template.
        # We only want to check if user added NEW dangerous code.
        is_safe, violations = analyze_code_security(user_code)

        if not is_safe and not allow_imports and not check_user_code_only:
            return {
                'success': False,
                'output': '',
                'error': 'Security violation detected',
                'violations': violations
            }

        # Step 2: Compile code to check for syntax errors
        try:
            compile(user_code, '<user_code>', 'exec')
        except SyntaxError as e:
            return {
                'success': False,
                'output': '',
                'error': f'SyntaxError: {e.msg}',
                'violations': [],
                'syntax_error': {
                    'type': 'SyntaxError',
                    'msg': e.msg,
                    'lineno': e.lineno or 1,
                    'offset': e.offset or 1,
                    'line': (e.text or '').rstrip('\n')
                }
            }

        # Step 3: Create execution environment
        # If check_user_code_only=True, we trust the code has template imports
        # and use normal builtins so imports work.
        # Otherwise, use restricted builtins for maximum security.
        import builtins
        namespace = {
            '__builtins__': builtins if check_user_code_only else self.safe_builtins,
            '__name__': '__main__',
            '__doc__': None,
        }

        # Step 4: Execute with timeout and capture output
        old_stdout = sys.stdout
        stdout_capture = io.StringIO()

        try:
            sys.stdout = stdout_capture

            # Execute with or without timeout based on configuration
            if self.enable_timeout and hasattr(signal, 'SIGALRM'):
                with timeout_context(timeout):
                    exec(user_code, namespace)
                    if test_code:
                        exec(test_code, namespace)
            else:
                # No timeout support (Windows or disabled)
                exec(user_code, namespace)
                if test_code:
                    exec(test_code, namespace)

            output = stdout_capture.getvalue()

            return {
                'success': True,
                'output': output,
                'error': '',
                'violations': violations if allow_imports else [],
                'namespace': namespace
            }

        except TimeoutError as e:
            return {
                'success': False,
                'output': stdout_capture.getvalue(),
                'error': str(e),
                'violations': violations
            }
        except Exception as e:
            error_traceback = traceback.format_exc()
            return {
                'success': False,
                'output': stdout_capture.getvalue(),
                'error': f'{type(e).__name__}: {str(e)}',
                'traceback': error_traceback,
                'violations': violations
            }
        finally:
            sys.stdout = old_stdout


    def execute_with_template(
        self,
        full_code: str,
        user_code: str,
        timeout: int = 10
    ) -> Dict[str, Any]:
        """
        Execute code that combines a trusted template with user submissions.

        This is the recommended method for problem-solving platforms where:
        - Template contains imports and test infrastructure (TRUSTED)
        - User provides solution code (UNTRUSTED)
        - Full code = template imports + user code + template tests

        Args:
            full_code: Complete code to execute (template + user + tests)
            user_code: Only the user's submitted code (for security analysis)
            timeout: Maximum execution time in seconds

        Returns:
            Execution result dictionary

        Example:
            executor = SafeExecutor()
            result = executor.execute_with_template(
                full_code=template_with_user_code,  # Has template imports
                user_code=user_solution,  # Check this for exploits
                timeout=10
            )
        """
        # Analyze only the user's code for security violations
        is_safe, violations = analyze_code_security(user_code)

        if not is_safe:
            return {
                'success': False,
                'output': '',
                'error': 'Security violation detected',
                'violations': violations
            }

        # User code is safe, execute the full code (template + user + tests)
        # We still use timeout protection
        old_stdout = sys.stdout
        stdout_capture = io.StringIO()

        # Create namespace to capture test results
        namespace = {'__name__': '__main__'}

        try:
            sys.stdout = stdout_capture

            # Execute with timeout but allow template imports
            # Note: timeout only works in main thread; Django handlers run in worker threads
            if self.enable_timeout:
                with timeout_context(timeout):
                    exec(full_code, namespace)
            else:
                exec(full_code, namespace)

            output = stdout_capture.getvalue()

            return {
                'success': True,
                'output': output,
                'error': '',
                'violations': [],
                'namespace': namespace  # Return namespace so test results can be extracted
            }

        except TimeoutError as e:
            return {
                'success': False,
                'output': stdout_capture.getvalue(),
                'error': str(e),
                'violations': violations
            }
        except Exception as e:
            error_traceback = traceback.format_exc()
            return {
                'success': False,
                'output': stdout_capture.getvalue(),
                'error': f'{type(e).__name__}: {str(e)}',
                'traceback': error_traceback,
                'violations': violations
            }
        finally:
            sys.stdout = old_stdout


# Convenience function for backward compatibility
def safe_exec(
    code: str,
    test_code: str = "",
    timeout: int = 5,
    allow_imports: bool = False
) -> Dict[str, Any]:
    """
    Convenience function to execute code safely.

    Args:
        code: User's Python code
        test_code: Optional test code to run
        timeout: Execution timeout in seconds
        allow_imports: Whether to allow import statements

    Returns:
        Execution result dictionary
    """
    executor = SafeExecutor()
    return executor.execute(code, test_code, timeout, allow_imports)

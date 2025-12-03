"""
Timeout helpers that work in both main thread and worker threads.

For Django/Flask apps where requests run in worker threads, signal-based
timeouts don't work. This module provides multiprocessing-based alternatives.
"""

import multiprocessing
import sys
import io
from typing import Dict, Any


def execute_with_process_timeout(code: str, namespace: Dict, timeout: int) -> Dict[str, Any]:
    """
    Execute code in a separate process with timeout.

    This works in any thread, unlike signal-based timeouts.
    Uses multiprocessing to run code in isolated process.

    Args:
        code: Python code to execute
        namespace: Execution namespace
        timeout: Timeout in seconds

    Returns:
        Dict with 'success', 'output', 'error', 'timeout_occurred'
    """
    def worker(code, namespace, output_queue):
        """Worker function that runs in separate process."""
        old_stdout = sys.stdout
        stdout_capture = io.StringIO()

        try:
            sys.stdout = stdout_capture
            exec(code, namespace)
            output = stdout_capture.getvalue()
            output_queue.put({
                'success': True,
                'output': output,
                'error': None,
                'namespace': namespace
            })
        except Exception as e:
            output_queue.put({
                'success': False,
                'output': stdout_capture.getvalue(),
                'error': f'{type(e).__name__}: {str(e)}',
                'namespace': None
            })
        finally:
            sys.stdout = old_stdout

    # Create queue for inter-process communication
    output_queue = multiprocessing.Queue()

    # Start process
    process = multiprocessing.Process(
        target=worker,
        args=(code, namespace, output_queue)
    )
    process.start()

    # Wait for completion with timeout
    process.join(timeout=timeout)

    if process.is_alive():
        # Timeout occurred - kill the process
        process.terminate()
        process.join(timeout=1)
        if process.is_alive():
            process.kill()
            process.join()

        return {
            'success': False,
            'output': '',
            'error': f'Code execution exceeded {timeout} second timeout',
            'timeout_occurred': True
        }

    # Process completed - get result
    if not output_queue.empty():
        result = output_queue.get()
        result['timeout_occurred'] = False
        return result
    else:
        # Process died without output
        return {
            'success': False,
            'output': '',
            'error': 'Process terminated unexpectedly',
            'timeout_occurred': False
        }


# Note: Multiprocessing has overhead and pickling limitations
# For better performance in production, consider:
# 1. Using Docker containers with CPU/memory limits
# 2. Running code execution service in separate process pool
# 3. Using Celery for async task execution with timeouts

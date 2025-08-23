''''''
from typing import *
''''''
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def recursive_sum(head: Optional[ListNode]) -> int:
    """
    Recursively compute the sum of all values in a linked list.
    
    Args:
        head: ListNode - the head of the linked list
    
    Returns:
        int: sum of all values in the list
    """
    # User code will be inserted here
    pass
''''''
def run_test(test_input, expected):
    exception = ""
    result = ""
    try:
        # Create linked list from test_input list
        if not test_input:
            head = None
        else:
            head = ListNode(test_input[0])
            current = head
            for val in test_input[1:]:
                current.next = ListNode(val)
                current = current.next
        
        result = recursive_sum(head)
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
    ([1, 2, 3, 4], 10),
    ([5], 5),
    ([], 0),
    ([10, -5, 3], 8),
    ([0, 0, 0], 0)
]
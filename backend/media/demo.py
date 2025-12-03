from typing import *
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right

def to_string(node):
  return ""
def build_tree(bfs_list):
    if not bfs_list or bfs_list[0] is None:
        return None

    root = Node(bfs_list[0])
    queue = [root]
    i = 1

    while queue and i < len(bfs_list):
        current = queue.pop(0)

        if i < len(bfs_list) and bfs_list[i] is not None:
            current.left = Node(bfs_list[i])
            queue.append(current.left)
        i += 1

        if i < len(bfs_list) and bfs_list[i] is not None:
            current.right = Node(bfs_list[i])
            queue.append(current.right)
        i += 1

    return root


def run_test(input, expected):
    bfs_list = input
    exception = ""
    result = ""
    try:
        root = build_tree(bfs_list)
        result = to_string(root)
    except Exception as e:
        exception = str(e)
    return {
        "input": input,
        "expected": expected,
        "actual": result,
        "error": exception,
        "passed": result == expected if not exception else False
    }



test_cases = [
    ([10], "10()()"),
    ([10, 5, 15], "10(5)(15)"),
    ([10, 5], "10(5)()"),
    ([10, None, 15], "10()(15)"),
    ([20, 8, 22], "20(8)(22)"),
    ([100], "100()()"),
    ([50, 25], "50(25)()"),
    ([50, None, 75], "50()(75)"),
    ([1, 2, 3], "1(2)(3)"),
]

results = {f"test_{i}": run_test(input, expected) for i, (input, expected) in enumerate(test_cases)}

for test_name, result in results.items():
    status = "PASSED" if result["passed"] else "FAILED"
    print(f"{test_name}: {status}")
    if not result["passed"]:
        print(f"  Input BFS: {result['input']}")
        print(f"  Expected: {result['expected']}")
        print(f"  Actual: {result['actual']}")
        if result['error']:
            print(f"  Error: {result['error']}")

passed = sum(1 for r in results.values() if r["passed"])
total = len(results)
print(f"\n{passed}/{total} tests passed")


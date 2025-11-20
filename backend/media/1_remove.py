''''''
from typing import *
class Node:
    def __init__(self,val=0,left=None,right=None):
        self.val = val 
        self.left = left 
        self.right = right
''''''
def remove(root,target):
	if not root:
		return None 
	if  root.val > target: 
		root.left = remove(root.left,target)
	elif root.val < target:
		root.right = remove(root.right,target)
	else:
		if not root.left: return root.right 
		if not root.right: return root.left
		pred = find_max(root.left)
		root.val = pred.val 
		root.left = remove_max(root.left)
	return root

def find_max(root):
	if not root.right:
		return root
	return find_max(root.right)

def remove_max(root):
	if not root.right:
		return root.left
	root.right = remove_max(root.right)
	return root

''''''
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

def tree_to_bfs(root):
    if not root:
        return []

    result = []
    queue = [root]

    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)

    while result and result[-1] is None:
        result.pop()

    return result

def run_test(bfs_list, target, expected):
    root = build_tree(bfs_list)
    result = remove(root, target)
    result_list = tree_to_bfs(result)

    return {"bfs_list": bfs_list,
          "target": target,
          "expected": expected,
          "actual": result_list,
        }
test_cases = [
    ([5, 3, 7], 3, [5, None, 7]),

    ([5, 3, 7], 5, [3, None, 7]),

    ([5, 3, 7, 1,None,None,None], 3, [5, 1, 7]),
]
results = { f"{i}": run_test(node, targ, expected) for i, (node, targ, expected) in enumerate(test_cases)}
print(results)
""""""

from typing import *
import subprocess
from pathlib import Path
import sys


class Node:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


""""""


def remove(root, target):
    if not root:
        return None
    if root.val > target:
        root.left = remove(root.left, target)
    elif root.val < target:
        root.right = remove(root.right, target)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        pred = find_max(root.left)
        root.val = pred
        root.left = remove_max(root.left)
    return root


def find_max(root):
    if not root.right:
        return root.val
    return find_max(root.right)


def remove_max(root):
    if not root.right:
        return root.left
    root.right = remove_max(root.right)
    return root


""""""


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

    return {
        "root": bfs_list,
        "target": target,
        "expected": expected,
        "actual": result_list,
    }


def animate_test_case(case_index: int, out_prefix: str = "bst_case") -> str:
    """
    Render a BST animation for a specific test case using the bst.py framework.

    Returns the relative mp4 path emitted by manim.
    """
    if case_index < 0 or case_index >= len(test_cases):
        raise IndexError(f"case_index {case_index} out of range for test_cases")

    bfs_list, target, _ = test_cases[case_index]
    initial_values = [v for v in bfs_list if v is not None]

    template_dir = Path(__file__).resolve().parents[1] / "animations" / "templates"
    script_path = Path(__file__).with_name(f"{out_prefix}_{case_index}.py")

    script_path.write_text(
        "\n".join(
            [
                "from manim import *",
                "import sys",
                "from pathlib import Path",
                f'sys.path.append(r"{str(template_dir)}")',
                "from bst import BstVisualizer",
                "",
                "class BstExample(Scene):",
                "    def construct(self):",
                f"        bst = BstVisualizer(initial_values={initial_values}, scale_factor=0.7)",
                "        self.play(bst.create()); self.wait(0.5)",
                f"        self.play(bst.delete({target})); self.wait(0.75)",
                "",
            ]
        ),
        encoding="utf-8",
    )

    output_name = f"{out_prefix}_{case_index}"
    subprocess.run(
        [
            "manim",
            str(script_path),
            "BstExample",
            "-ql",
            "-o",
            output_name,
            "--disable_caching",
        ],
        check=True,
    )

    return f"media/videos/{output_name}/480p15/{output_name}.mp4"


test_cases = [
    ([5, 3, 7], 3, [5, None, 7]),
    ([5, 3, 7], 5, [3, None, 7]),
    ([5, 3, 7, 1], 3, [5, 1, 7]),
]
results = {
    f"{i}": run_test(node, targ, expected)
    for i, (node, targ, expected) in enumerate(test_cases)
}
print(results)

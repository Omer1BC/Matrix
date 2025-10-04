# management/commands/populate_problems.py
# Create this file in: your_app/management/commands/populate_problems.py

from django.core.management.base import BaseCommand
from api.models import ProblemCategory, Problem  # Replace 'your_app' with your actual app name
import json

class Command(BaseCommand):
    help = 'Populate the database with initial problem categories and problems'

    def handle(self, *args, **options):
        # Clear existing data (optional)
        Problem.objects.all().delete()
        ProblemCategory.objects.all().delete()
        
        problem_categories_data = {
            'introduction': {
                'title': "Introduction",
                'icon': "",
                'items': [
                    {
                        "id": "intro-1",
                        "title": "Recursive Sum of Linked List",
                        "description": "Write a recursive function to compute the sum of all values in a linked list. Each node has a value and a reference to the next node.",
                        "difficulty": "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        "starter_code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef recursive_sum(head):\n    if head is None:\n        return 0\n    return head.val + recursive_sum(head.next)\n\n",
                        "solution": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef recursive_sum(head):\n    if head is None:\n        return 0\n    return head.val + recursive_sum(head.next)\n\n",
                        "test_cases": [
                            {
                                "input": "LinkedList: 1->2->3->4",
                                "expected_output": "10",
                                "description": "Should return sum 1+2+3+4=10"
                            },
                            {
                                "input": "LinkedList: 5",
                                "expected_output": "5",
                                "description": "Should handle single node list"
                            },
                            {
                                "input": "LinkedList: None",
                                "expected_output": "0",
                                "description": "Should return 0 for empty list"
                            }
                        ]
                    },
                ]
            },
            'nodesandedges': {
                'title': "Building Blocks",
                'icon': "",
                'items': [
                    {
                        'id': "ds-1",
                        'title': "Nodes, Edges, & Cycles",
                        'description': "Given a Node class and the head of a linked list, detect if there's a cycle in the linked list.",
                        'difficulty': "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        'starter_code': 'class Node:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef has_cycle(head):\n    """\n    Detect if there is a cycle in the linked list.\n    Args:\n        head: Node - head of the linked list\n    Returns:\n        bool: True if cycle exists, False otherwise\n    """\n    # Implement cycle detection using Floyd\'s algorithm\n    pass\n\n',
                        'solution': 'class Node:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef has_cycle(head):\n    if not head or not head.next:\n        return False\n    \n    slow = head\n    fast = head\n    \n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        \n        if slow == fast:\n            return True\n    \n    return False\n\n',
                        'test_cases': [
                            {
                                'input': 'Linked list with cycle: 1->2->3->2 (cycle)',
                                'expected_output': 'True',
                                'description': 'Should detect cycle in linked list'
                            },
                            {
                                'input': 'Linked list without cycle: 1->2->3->None',
                                'expected_output': 'False',
                                'description': 'Should return False for list with no cycle'
                            },
                            {
                                'input': 'Empty list',
                                'expected_output': 'False',
                                'description': 'Should return False for empty list'
                            }
                        ]
                    },
                    {
                        'id': "ds-2", 
                        'title': "Components", 
                        'description': "",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '''def is_tree(edges: List[Tuple[str, str]]) -> bool:
    return False''',
                        'solution': 'class Edge:\n    def __init__(self, from_node, to_node, weight=1):\n        self.from_node = from_node\n        self.to_node = to_node\n        self.weight = weight\n    \n    def get_weight(self):\n        return self.weight\n    \n    def get_nodes(self):\n        return (self.from_node, self.to_node)\n\nedge = Edge("A", "B", 5)\nprint(f"Edge from {edge.get_nodes()[0]} to {edge.get_nodes()[1]} with weight {edge.get_weight()}")',
                        'test_cases': [
                            {
                                'input': 'Edge("A", "B", 5)',
                                'expected_output': 'Edge from A to B with weight 5',
                                'description': 'Should create edge with weight'
                            }
                        ]
                    },
                   
                ]
            },
            
            'representation': {
                'title': "Graph Representation",
                'icon': "",
                'items': [
                    {
                        'id': "rep-1", 
                        'title': "Adjacency List Implementation", 
                        'description': "Give a list of edges where edges[i] = [a,b] represents an undirected edge, create an adjancecy list representation.",
                        'difficulty': "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        'starter_code': '''def edges_to_adj_list(edges: List[List[int]]) -> Dict[int, List[int]]:
    """Convert edge list to adjacency list representation"""
    pass''',
                        'solution': '''def build_adjacency_list(edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return graph''',
                        'test_cases': [
                            {
                                'input': 'Graph with vertices A,B,C and edges A-B, B-C',
                                'expected_output': 'A: [\'B\']\nB: [\'A\', \'C\']\nC: [\'B\']',
                                'description': 'Should create adjacency list representation'
                            }
                        ]
                    },
                    {
                        'id': "rep-2", 
                        'title': "Adjacency Matrix Implementation", 
                        'description': "",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '''def edges_to_adj_matrix(edges: List[List[int]]) -> List[List[int]]:
    """Convert edge list to adjacency matrix representation"""
    # User code will be inserted here
    pass''',
                        'solution': 'class GraphMatrix:\n    def __init__(self, num_vertices):\n        self.num_vertices = num_vertices\n        self.matrix = [[0 for _ in range(num_vertices)] for _ in range(num_vertices)]\n        self.vertex_map = {}\n        self.vertex_count = 0\n    \n    def add_vertex(self, vertex):\n        if vertex not in self.vertex_map and self.vertex_count < self.num_vertices:\n            self.vertex_map[vertex] = self.vertex_count\n            self.vertex_count += 1\n    \n    def add_edge(self, v1, v2, weight=1):\n        if v1 in self.vertex_map and v2 in self.vertex_map:\n            i, j = self.vertex_map[v1], self.vertex_map[v2]\n            self.matrix[i][j] = weight\n            self.matrix[j][i] = weight  # For undirected graph\n    \n    def has_edge(self, v1, v2):\n        if v1 in self.vertex_map and v2 in self.vertex_map:\n            i, j = self.vertex_map[v1], self.vertex_map[v2]\n            return self.matrix[i][j] != 0\n        return False\n    \n    def get_matrix(self):\n        return self.matrix\n\ng = GraphMatrix(3)\ng.add_vertex("A")\ng.add_vertex("B") \ng.add_vertex("C")\ng.add_edge("A", "B", 5)\ng.add_edge("B", "C", 3)\nprint("Matrix:")\nfor row in g.get_matrix():\n    print(row)',
                        'test_cases': [
                            {
                                'input': 'GraphMatrix with A-B(weight=5), B-C(weight=3)',
                                'expected_output': 'Matrix with non-zero values at appropriate positions',
                                'description': 'Should create adjacency matrix with weights'
                            }
                        ]
                    }
                ]
            },

            # 'traversal': {
            #     'title': "Graph Traversal",
            #     'icon': "",
            #     'items': [
            #         {
            #             'id': "trav-1", 
            #             'title': "DFS Fibonacci Tree", 
            #             'description': "",
            #             'difficulty': "Medium",
            #             "is_locked_by_default":False,
            #             'points_reward':1,
            #             'starter_code': '# DFS traversal of fibonacci tree\n\nclass TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef build_fib_tree(n):\n    """\n    Build a tree where each node contains fibonacci numbers.\n    Left child: fib(n-1), Right child: fib(n-2)\n    """\n    if n <= 1:\n        return TreeNode(1 if n == 1 else 0)\n    \n    root = TreeNode(fibonacci(n))\n    if n > 1:\n        root.left = build_fib_tree(n-1)\n    if n > 2:\n        root.right = build_fib_tree(n-2)\n    return root\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\ndef dfs_fibonacci_tree(root):\n    """\n    Perform DFS traversal on fibonacci tree.\n    Returns list of values in DFS pre-order.\n    """\n    # Implement DFS traversal\n    pass\n\n',
            #             'solution': 'class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef build_fib_tree(n):\n    if n <= 1:\n        return TreeNode(1 if n == 1 else 0)\n    \n    root = TreeNode(fibonacci(n))\n    if n > 1:\n        root.left = build_fib_tree(n-1)\n    if n > 2:\n        root.right = build_fib_tree(n-2)\n    return root\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\ndef dfs_fibonacci_tree(root):\n    if not root:\n        return []\n    \n    result = []\n    stack = [root]\n    \n    while stack:\n        node = stack.pop()\n        result.append(node.val)\n        \n        # Add right child first so left is processed first\n        if node.right:\n            stack.append(node.right)\n        if node.left:\n            stack.append(node.left)\n    \n    return result\n\nfib_tree = build_fib_tree(4)\nresult = dfs_fibonacci_tree(fib_tree)\nprint(f"DFS traversal: {result}")',
            #             'test_cases': [
            #                 {
            #                     'input': 'fibonacci tree of depth 4',
            #                     'expected_output': 'DFS pre-order traversal values',
            #                     'description': 'Should return DFS traversal of fib tree'
            #                 }
            #             ]
            #         },
            #         {
            #             'id': "trav-2", 
            #             'title': "BFS Layer Sum", 
            #             'description': "",
            #             'difficulty': "Medium",
            #             "is_locked_by_default":True,
            #             'points_reward':1,
            #             'starter_code': '# BFS to calculate sum for each layer\n\nfrom collections import deque\n\nclass GraphNode:\n    def __init__(self, val):\n        self.val = val\n        self.neighbors = []\n\ndef bfs_layer_sums(start_node):\n    """\n    Perform BFS and return sum of values at each layer.\n    Args:\n        start_node: GraphNode - starting node for BFS\n    Returns:\n        list: sum of values at each layer [layer0_sum, layer1_sum, ...]\n    """\n    # Implement BFS with layer sum calculation\n    pass\n\n',
            #             'solution': 'from collections import deque\n\nclass GraphNode:\n    def __init__(self, val):\n        self.val = val\n        self.neighbors = []\n\ndef bfs_layer_sums(start_node):\n    if not start_node:\n        return []\n    \n    layer_sums = []\n    queue = deque([start_node])\n    visited = {start_node}\n    \n    while queue:\n        layer_size = len(queue)\n        layer_sum = 0\n        \n        for _ in range(layer_size):\n            node = queue.popleft()\n            layer_sum += node.val\n            \n            for neighbor in node.neighbors:\n                if neighbor not in visited:\n                    visited.add(neighbor)\n                    queue.append(neighbor)\n        \n        layer_sums.append(layer_sum)\n    \n    return layer_sums\n\n',
            #             'test_cases': [
            #                 {
            #                     'input': 'Graph with layers: A(5) -> {B(3), C(7)} -> {D(2), E(4)}',
            #                     'expected_output': 'Layer sums: [5, 10, 6]',
            #                     'description': 'Should return [5, 10, 6] for the three layers'
            #                 }
            #             ]
            #         }
            #     ]
            # },

        }

        # Create categories and problems
        for order, (key, category_data) in enumerate(problem_categories_data.items()):
            # Create category
            category = ProblemCategory.objects.create(
                key=key,
                title=category_data['title'],
                icon=category_data['icon'],
                order=order
            )
            
            self.stdout.write(f"Created category: {category.title}")
            
            # Create problems for this category
            for problem_order, item in enumerate(category_data['items']):
                # Convert test_cases to JSON string for storage
                test_cases_json = json.dumps(item.get('test_cases', []))
                
                problem = Problem.objects.create(
                    category=category,
                    problem_id=item['id'],
                    title=item['title'],
                    description=item['description'],
                    difficulty=item['difficulty'],
                    order=problem_order,
                    method_stub=item.get('starter_code', '# Write your code here\npass'),
                    solution=item.get('solution', ''),
                    test_cases=test_cases_json,
                    is_locked_by_default=item['is_locked_by_default'],
                    points_reward=item['points_reward'],
                    input_args=[],
                    tools={}
                )
                self.stdout.write(f"  Created problem: {problem.title}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {ProblemCategory.objects.count()} categories '
                f'and {Problem.objects.count()} problems'
            )
        )
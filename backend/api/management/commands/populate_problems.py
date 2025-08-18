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
                'icon': "🚀",
                'items': [
                    {
                        "id": "intro-1",
                        "title": "Linear Vs Non-Linear Graphs",
                        "description": "Write a program that will compute the sum of all node values in a non-linear graph structure. The graph is represented as an adjacency list where each node has a value and connections to other nodes.",
                        "difficulty": "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        "starter_code": "# Write a program that computes the sum of all node values in a graph\n# The graph is represented as a dictionary where keys are node names\n# and values are dictionaries containing 'value' and 'connections'\n#\n# Example graph structure:\n# graph = {\n#     'A': {'value': 5, 'connections': ['B', 'C']},\n#     'B': {'value': 3, 'connections': ['A', 'D']},\n#     'C': {'value': 7, 'connections': ['A']},\n#     'D': {'value': 2, 'connections': ['B']}\n# }\n\ndef compute_graph_sum(graph):\n    # Replace pass with your implementation\n    pass",
                        "solution": "def compute_graph_sum(graph):\n    total_sum = 0\n    for node in graph:\n        total_sum += graph[node]['value']\n    return total_sum\n\n",
                        "test_cases": [
                            {
                                "input": "{'A': {'value': 5, 'connections': ['B', 'C']}, 'B': {'value': 3, 'connections': ['A', 'D']}, 'C': {'value': 7, 'connections': ['A']}, 'D': {'value': 2, 'connections': ['B']}}",
                                "expected_output": "17",
                                "description": "Should return the sum of all node values (5+3+7+2=17)"
                            },
                            {
                                "input": "{'X': {'value': 10, 'connections': []}}",
                                "expected_output": "10",
                                "description": "Should handle single node graph"
                            },
                            {
                                "input": "{'A': {'value': 1, 'connections': ['B']}, 'B': {'value': 2, 'connections': ['C']}, 'C': {'value': 3, 'connections': []}}",
                                "expected_output": "6",
                                "description": "Should handle linear chain of nodes (1+2+3=6)"
                            }
                        ]
                    },
                    {
                        "id": "intro-2",
                        "title": "Recursive Sum of Linked List",
                        "description": "Write a recursive function to compute the sum of all values in a linked list. Each node has a value and a reference to the next node.",
                        "difficulty": "Easy",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        "starter_code": "# Linked List Node class\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef recursive_sum(head):\n    \"\"\"\n    Recursively compute the sum of all values in a linked list.\n    Args:\n        head: ListNode - the head of the linked list\n    Returns:\n        int - sum of all values in the list\n    \"\"\"\n    # Replace pass with your recursive implementation\n    pass\n\n",
                        "solution": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef recursive_sum(head):\n    # Base case: if head is None, return 0\n    if head is None:\n        return 0\n    # Recursive case: current value + sum of rest\n    return head.val + recursive_sum(head.next)\n\n",
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
            'representation': {
                'title': "Graph Representation",
                'icon': "🗂️",
                'items': [
                    {
                        'id': "rep-1", 
                        'title': "Adjacency List Implementation", 
                        'description': "Create a Graph class using adjacency list representation. Implement methods to add vertices, add edges, and display the graph.",
                        'difficulty': "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        'starter_code': '# Implement a Graph using Adjacency List\n\nclass Graph:\n    def __init__(self):\n        # Initialize empty adjacency list\n        pass\n    \n    def add_vertex(self, vertex):\n        # Add a vertex to the graph\n        pass\n    \n    def add_edge(self, v1, v2):\n        # Add an edge between v1 and v2 (undirected)\n        pass\n    \n    def get_neighbors(self, vertex):\n        # Return list of neighbors for given vertex\n        pass\n    \n    def display(self):\n        # Print the adjacency list representation\n        pass\n\n',
                        'solution': 'class Graph:\n    def __init__(self):\n        self.adj_list = {}\n    \n    def add_vertex(self, vertex):\n        if vertex not in self.adj_list:\n            self.adj_list[vertex] = []\n    \n    def add_edge(self, v1, v2):\n        # Add both vertices if they don\'t exist\n        self.add_vertex(v1)\n        self.add_vertex(v2)\n        # Add edge in both directions (undirected)\n        self.adj_list[v1].append(v2)\n        self.adj_list[v2].append(v1)\n    \n    def get_neighbors(self, vertex):\n        return self.adj_list.get(vertex, [])\n    \n    def display(self):\n        for vertex in self.adj_list:\n            print(f"{vertex}: {self.adj_list[vertex]}")\n\ng = Graph()\ng.add_vertex("A")\ng.add_vertex("B")\ng.add_vertex("C")\ng.add_edge("A", "B")\ng.add_edge("B", "C")\ng.display()',
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
                        'description': "Create a Graph class using adjacency matrix representation. Implement methods to add edges and check if an edge exists.",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Implement a Graph using Adjacency Matrix\n\nclass GraphMatrix:\n    def __init__(self, num_vertices):\n        # Initialize adjacency matrix with zeros\n        # Create mapping from vertex names to indices\n        pass\n    \n    def add_vertex(self, vertex):\n        # Map vertex name to matrix index\n        pass\n    \n    def add_edge(self, v1, v2, weight=1):\n        # Add edge with optional weight\n        pass\n    \n    def has_edge(self, v1, v2):\n        # Check if edge exists between v1 and v2\n        pass\n    \n    def get_matrix(self):\n        # Return the adjacency matrix\n        pass\n\n',
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
            'nodesandedges': {
                'title': "Nodes & Edges",
                'icon': "📊",
                'items': [
                    {
                        'id': "ds-1", 
                        'title': "Node Representation", 
                        'description': "Learn how to represent a node in a graph structure. Create a simple Node class with value and connections.",
                        'difficulty': "Easy",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        'starter_code': '# Create a Node class for graph representation\n\nclass Node:\n    def __init__(self, value):\n        # Initialize node with a value and empty connections list\n        pass\n    \n    def add_connection(self, node):\n        # Add a connection to another node\n        pass\n    \n    def get_connections(self):\n        # Return list of connected nodes\n        pass\n\n',
                        'solution': 'class Node:\n    def __init__(self, value):\n        self.value = value\n        self.connections = []\n    \n    def add_connection(self, node):\n        if node not in self.connections:\n            self.connections.append(node)\n    \n    def get_connections(self):\n        return self.connections\n\nnode1 = Node("A")\nnode2 = Node("B")\nnode1.add_connection(node2)\nprint(f"Node {node1.value} connects to: {[n.value for n in node1.get_connections()]}")',
                        'test_cases': [
                            {
                                'input': 'Node creation and connection',
                                'expected_output': 'Node A connects to: [\'B\']',
                                'description': 'Should create nodes and establish connections'
                            }
                        ]
                    },
                    {
                        'id': "ds-2", 
                        'title': "Edge Representation", 
                        'description': "Create an Edge class to represent connections between nodes with optional weights.",
                        'difficulty': "Easy",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Create an Edge class for graph connections\n\nclass Edge:\n    def __init__(self, from_node, to_node, weight=1):\n        # Initialize edge with from_node, to_node, and optional weight\n        pass\n    \n    def get_weight(self):\n        # Return the weight of the edge\n        pass\n    \n    def get_nodes(self):\n        # Return tuple of (from_node, to_node)\n        pass\n\n',
                        'solution': 'class Edge:\n    def __init__(self, from_node, to_node, weight=1):\n        self.from_node = from_node\n        self.to_node = to_node\n        self.weight = weight\n    \n    def get_weight(self):\n        return self.weight\n    \n    def get_nodes(self):\n        return (self.from_node, self.to_node)\n\nedge = Edge("A", "B", 5)\nprint(f"Edge from {edge.get_nodes()[0]} to {edge.get_nodes()[1]} with weight {edge.get_weight()}")',
                        'test_cases': [
                            {
                                'input': 'Edge("A", "B", 5)',
                                'expected_output': 'Edge from A to B with weight 5',
                                'description': 'Should create edge with weight'
                            }
                        ]
                    },
                    {
                        'id': "ds-3", 
                        'title': "Cycle Detection", 
                        'description': "Implement a function to detect if a cycle exists in a simple graph representation.",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Detect cycles in a graph\n\ndef has_cycle(graph):\n    """\n    Detect if there is a cycle in the graph.\n    graph: dictionary where keys are nodes and values are lists of connected nodes\n    Returns: True if cycle exists, False otherwise\n    """\n    # Implement cycle detection algorithm\n    pass\n\n',
                        'solution': 'def has_cycle(graph):\n    visited = set()\n    rec_stack = set()\n    \n    def dfs(node):\n        if node in rec_stack:\n            return True\n        if node in visited:\n            return False\n            \n        visited.add(node)\n        rec_stack.add(node)\n        \n        for neighbor in graph.get(node, []):\n            if dfs(neighbor):\n                return True\n                \n        rec_stack.remove(node)\n        return False\n    \n    for node in graph:\n        if node not in visited:\n            if dfs(node):\n                return True\n    return False\n\ngraph = {\n    "A": ["B"],\n    "B": ["C"],\n    "C": ["A"]\n}\n\nprint(f"Cycle detected: {has_cycle(graph)}")',
                        'test_cases': [
                            {
                                'input': 'Graph with cycle: A->B->C->A',
                                'expected_output': 'Cycle detected: True',
                                'description': 'Should detect cycle in graph'
                            }
                        ]
                    },
                    {
                        'id': "ds-4", 
                        'title': "Valid Components from Edge List", 
                        'description': "Given a list of edges, determine if they form valid connected components (no duplicate edges, valid connections).",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Check if edge list forms valid components\n\ndef are_valid_components(edges, num_vertices):\n    """\n    Check if the given edges form valid connected components.\n    Args:\n        edges: list of tuples representing edges [(u, v), ...]\n        num_vertices: total number of vertices expected\n    Returns:\n        bool: True if edges form valid components, False otherwise\n    """\n    # Implement validation logic\n    pass\n\n',
                        'solution': 'def are_valid_components(edges, num_vertices):\n    if not edges and num_vertices == 0:\n        return True\n    \n    # Check for invalid vertices\n    for u, v in edges:\n        if u < 0 or v < 0 or u >= num_vertices or v >= num_vertices:\n            return False\n        if u == v:  # Self-loop check\n            return False\n    \n    # Check for duplicate edges\n    edge_set = set()\n    for u, v in edges:\n        edge = (min(u, v), max(u, v))  # Normalize edge representation\n        if edge in edge_set:\n            return False  # Duplicate edge\n        edge_set.add(edge)\n    \n    # Build adjacency list to verify connectivity\n    graph = [[] for _ in range(num_vertices)]\n    for u, v in edges:\n        graph[u].append(v)\n        graph[v].append(u)\n    \n    # All edges should form valid connections\n    return True\n\nedges = [(0, 1), (1, 2), (3, 4)]\nnum_vertices = 5\nresult = are_valid_components(edges, num_vertices)\nprint(f"Valid components: {result}")',
                        'test_cases': [
                            {
                                'input': 'edges=[(0,1), (1,2), (3,4)], vertices=5',
                                'expected_output': 'Valid components: True',
                                'description': 'Should validate proper edge list'
                            },
                            {
                                'input': 'edges=[(0,1), (0,1)], vertices=2',
                                'expected_output': 'Valid components: False',
                                'description': 'Should reject duplicate edges'
                            }
                        ]
                    }
                ]
            },
            'traversal': {
                'title': "Graph Traversal",
                'icon': "🔍",
                'items': [
                    {
                        'id': "trav-1", 
                        'title': "DFS Fibonacci Tree", 
                        'description': "Use Depth-First Search to traverse a fibonacci-based tree structure and return all values in DFS order.",
                        'difficulty': "Medium",
                        "is_locked_by_default":False,
                        'points_reward':1,
                        'starter_code': '# DFS traversal of fibonacci tree\n\nclass TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef build_fib_tree(n):\n    """\n    Build a tree where each node contains fibonacci numbers.\n    Left child: fib(n-1), Right child: fib(n-2)\n    """\n    if n <= 1:\n        return TreeNode(1 if n == 1 else 0)\n    \n    root = TreeNode(fibonacci(n))\n    if n > 1:\n        root.left = build_fib_tree(n-1)\n    if n > 2:\n        root.right = build_fib_tree(n-2)\n    return root\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\ndef dfs_fibonacci_tree(root):\n    """\n    Perform DFS traversal on fibonacci tree.\n    Returns list of values in DFS pre-order.\n    """\n    # Implement DFS traversal\n    pass\n\n',
                        'solution': 'class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef build_fib_tree(n):\n    if n <= 1:\n        return TreeNode(1 if n == 1 else 0)\n    \n    root = TreeNode(fibonacci(n))\n    if n > 1:\n        root.left = build_fib_tree(n-1)\n    if n > 2:\n        root.right = build_fib_tree(n-2)\n    return root\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\ndef dfs_fibonacci_tree(root):\n    if not root:\n        return []\n    \n    result = []\n    stack = [root]\n    \n    while stack:\n        node = stack.pop()\n        result.append(node.val)\n        \n        # Add right child first so left is processed first\n        if node.right:\n            stack.append(node.right)\n        if node.left:\n            stack.append(node.left)\n    \n    return result\n\nfib_tree = build_fib_tree(4)\nresult = dfs_fibonacci_tree(fib_tree)\nprint(f"DFS traversal: {result}")',
                        'test_cases': [
                            {
                                'input': 'fibonacci tree of depth 4',
                                'expected_output': 'DFS pre-order traversal values',
                                'description': 'Should return DFS traversal of fib tree'
                            }
                        ]
                    },
                    {
                        'id': "trav-2", 
                        'title': "BFS Layer Sum", 
                        'description': "Use Breadth-First Search to traverse a graph and calculate the sum of values at each layer/level.",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# BFS to calculate sum for each layer\n\nfrom collections import deque\n\nclass GraphNode:\n    def __init__(self, val):\n        self.val = val\n        self.neighbors = []\n\ndef bfs_layer_sums(start_node):\n    """\n    Perform BFS and return sum of values at each layer.\n    Args:\n        start_node: GraphNode - starting node for BFS\n    Returns:\n        list: sum of values at each layer [layer0_sum, layer1_sum, ...]\n    """\n    # Implement BFS with layer sum calculation\n    pass\n\n',
                        'solution': 'from collections import deque\n\nclass GraphNode:\n    def __init__(self, val):\n        self.val = val\n        self.neighbors = []\n\ndef bfs_layer_sums(start_node):\n    if not start_node:\n        return []\n    \n    layer_sums = []\n    queue = deque([start_node])\n    visited = {start_node}\n    \n    while queue:\n        layer_size = len(queue)\n        layer_sum = 0\n        \n        for _ in range(layer_size):\n            node = queue.popleft()\n            layer_sum += node.val\n            \n            for neighbor in node.neighbors:\n                if neighbor not in visited:\n                    visited.add(neighbor)\n                    queue.append(neighbor)\n        \n        layer_sums.append(layer_sum)\n    \n    return layer_sums\n\n',
                        'test_cases': [
                            {
                                'input': 'Graph with layers: A(5) -> {B(3), C(7)} -> {D(2), E(4)}',
                                'expected_output': 'Layer sums: [5, 10, 6]',
                                'description': 'Should return [5, 10, 6] for the three layers'
                            }
                        ]
                    }
                ]
            },
            'pathsandcycles': {
                'title': "Paths And Cycles",
                'icon': "🔄",
                'items': [
                    {
                        'id': "path-1", 
                        'title': "Find Path", 
                        'description': "Find a path between two nodes in a graph using depth-first search.",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Find path between two nodes\n\ndef find_path(graph, start, end, path=[]):\n    """\n    Find a path from start to end node in the graph.\n    Returns the path as a list, or None if no path exists.\n    """\n    # Implement path finding algorithm\n    pass\n\n',
                        'solution': 'def find_path(graph, start, end, path=[]):\n    path = path + [start]\n    if start == end:\n        return path\n    if start not in graph:\n        return None\n    for node in graph[start]:\n        if node not in path:\n            newpath = find_path(graph, node, end, path)\n            if newpath:\n                return newpath\n    return None\n\ngraph = {\n    "A": ["B", "C"],\n    "B": ["D"],\n    "C": ["D"],\n    "D": ["E"],\n    "E": []\n}\n\npath = find_path(graph, "A", "E")\nprint(f"Path from A to E: {path}")',
                        'test_cases': [
                            {
                                'input': 'find_path(graph, "A", "E")',
                                'expected_output': "Path from A to E: ['A', 'B', 'D', 'E']",
                                'description': 'Should find path from A to E'
                            }
                        ]
                    }
                ]
            },
            'connectedcomponents': {
                'title': "Connected Components",
                'icon': "🔢",
                'items': [
                    {
                        'id': "cc-1", 
                        'title': "Count Components", 
                        'description': "Count the number of connected components in an undirected graph.",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Count connected components in a graph\n\ndef count_components(graph):\n    """\n    Count the number of connected components in an undirected graph.\n    Returns the number of components.\n    """\n    # Implement connected components counting\n    pass\n\n',
                        'solution': 'def count_components(graph):\n    visited = set()\n    components = 0\n    \n    def dfs(node):\n        if node in visited:\n            return\n        visited.add(node)\n        for neighbor in graph.get(node, []):\n            dfs(neighbor)\n    \n    for node in graph:\n        if node not in visited:\n            dfs(node)\n            components += 1\n    \n    return components\n\ngraph = {\n    "A": ["B"],\n    "B": ["A"],\n    "C": ["D"],\n    "D": ["C"],\n    "E": []\n}\n\ncomponents = count_components(graph)\nprint(f"Number of connected components: {components}")',
                        'test_cases': [
                            {
                                'input': 'Graph with 3 components: {A-B}, {C-D}, {E}',
                                'expected_output': 'Number of connected components: 3',
                                'description': 'Should count 3 separate components'
                            }
                        ]
                    }
                ]
            },
            'decision': {
                'title': "Decision Problems",
                'icon': "🤔",
                'items': [
                    {
                        'id': "dec-1", 
                        'title': "Even or Odd", 
                        'description': "Determine whether a given number is even or odd.",
                        'difficulty': "Easy",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Determine if a number is even or odd\n\ndef is_even(number):\n    """\n    Check if a number is even.\n    Returns True if even, False if odd.\n    """\n    # Implement even/odd check\n    pass\n\n',
                        'solution': 'def is_even(number):\n    return number % 2 == 0\n\ntest_numbers = [2, 3, 10, 15, 0]\nfor num in test_numbers:\n    result = "even" if is_even(num) else "odd"\n    print(f"{num} is {result}")',
                        'test_cases': [
                            {
                                'input': 'is_even(4)',
                                'expected_output': 'True',
                                'description': '4 should be even'
                            },
                            {
                                'input': 'is_even(7)',
                                'expected_output': 'False',
                                'description': '7 should be odd'
                            }
                        ]
                    },
                    {
                        'id': "dec-2", 
                        'title': "Prime Check", 
                        'description': "Check if a given number is prime (only divisible by 1 and itself).",
                        'difficulty': "Medium",
                        "is_locked_by_default":True,
                        'points_reward':1,
                        'starter_code': '# Check if a number is prime\n\ndef is_prime(n):\n    """\n    Check if a number is prime.\n    Returns True if prime, False otherwise.\n    """\n    # Implement prime checking algorithm\n    pass\n\n',
                        'solution': 'def is_prime(n):\n    if n < 2:\n        return False\n    if n == 2:\n        return True\n    if n % 2 == 0:\n        return False\n    \n    for i in range(3, int(n**0.5) + 1, 2):\n        if n % i == 0:\n            return False\n    return True\n\ntest_numbers = [2, 3, 4, 17, 25, 29]\nfor num in test_numbers:\n    result = "prime" if is_prime(num) else "not prime"\n    print(f"{num} is {result}")',
                        'test_cases': [
                            {
                                'input': 'is_prime(17)',
                                'expected_output': 'True',
                                'description': '17 should be prime'
                            },
                            {
                                'input': 'is_prime(25)',
                                'expected_output': 'False',
                                'description': '25 should not be prime'
                            }
                        ]
                    }
                ]
            }
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
from manim import *

class LinearToNonLinear(Scene):
    def construct(self):
        # Title
        title = Text("1.1 - Linear vs NonLinear Data Structures", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait()
        
        # Create horizontal linked list
        node_radius = 0.4
        spacing = 1.5
        
        # Create nodes for linked list
        nodes = []
        arrows = []
        for i in range(4):
            node = Circle(radius=node_radius, color=BLUE, fill_opacity=0.3)
            node.shift(LEFT * 2 + RIGHT * i * spacing)
            text = Text(str(i+1), font_size=28)
            text.move_to(node.get_center())
            node_group = VGroup(node, text)
            nodes.append(node_group)
            
            if i < 3:
                arrow = Arrow(
                    start=nodes[i].get_right() + RIGHT * 0.1,
                    end=nodes[i].get_right() + RIGHT * (spacing - 1),
                    buff=0,
                    color=WHITE
                )
                arrows.append(arrow)
        
        linked_list = VGroup(*nodes, *arrows)
        
        # Add linked list title
        linked_list_title = Text("Linked List", font_size=32, color=BLUE)
        linked_list_title.next_to(title, DOWN, buff=0.3)
        
        # Show linked list
        self.play(FadeIn(linked_list_title), FadeIn(linked_list))
        self.wait(2)
        
        # Fade out horizontal linked list
        self.play(FadeOut(linked_list), FadeOut(linked_list_title))
        self.wait(0.5)
        
        # Create vertical linked list (Linear Tree n=1)
        linear_title = Text("Linear Tree (n = 1)", font_size=32, color=YELLOW)
        linear_title.next_to(title, DOWN, buff=0.3)
        
        # Initialize arrays for tree structure
        tree_nodes = []
        tree_arrows = [None]  # arrows[0] is None since root has no parent arrow
        
        # Create vertical linked list using tree structure
        vertical_spacing = 1.2
        num_nodes = 4
        
        for i in range(num_nodes):
            node = Circle(radius=node_radius, color=GREEN, fill_opacity=0.3)
            node.shift(UP * (1.5 - i * vertical_spacing))
            text = Text(str(i+1), font_size=28)
            text.move_to(node.get_center())
            node_group = VGroup(node, text)
            tree_nodes.append(node_group)
            
            if i > 0:
                arrow = Line(
                    start=tree_nodes[i-1].get_bottom(),
                    end=node.get_top(),
                    color=WHITE
                )
                tree_arrows.append(arrow)
        
        # Show linear tree
        self.play(
            FadeIn(linear_title),
            *[FadeIn(tree_nodes[i]) for i in range(num_nodes)],
            *[FadeIn(tree_arrows[i]) for i in range(1, num_nodes)]
        )
        self.wait(2)
        
        # Fade out linear tree
        self.play(
            *[FadeOut(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeOut(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        
        # Create n=2 (binary tree)
        nary_title_2 = Text("n-ary Tree (n = 2)", font_size=32, color=ORANGE)
        nary_title_2.move_to(linear_title.get_center())
        
        # Binary tree nodes array
        n = 2
        tree_nodes = []
        tree_arrows = [None]
        
        # Manually position nodes for n=2, depth=3
        # Level 0: node 0 (root)
        node = Circle(radius=node_radius, color=RED, fill_opacity=0.3)
        node.move_to(UP * 2)
        text = Text("1", font_size=28)
        text.move_to(node.get_center())
        tree_nodes.append(VGroup(node, text))
        
        # Level 1: nodes 1, 2
        positions_level1 = [LEFT * 1.5, RIGHT * 1.5]
        for i, pos in enumerate(positions_level1):
            node = Circle(radius=node_radius, color=RED, fill_opacity=0.3)
            node.move_to(pos + UP * 0.3)
            text = Text(str(i+2), font_size=28)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            # Create arrow from parent
            parent_idx = (i + 1 - 1) // n  # = 0 for both
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+1][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Level 2: nodes 3, 4, 5, 6
        positions_level2 = [LEFT * 2.8 + DOWN * 1.7, LEFT * 0.9 + DOWN * 1.7, 
                           RIGHT * 0.9 + DOWN * 1.7, RIGHT * 2.8 + DOWN * 1.7]
        for i, pos in enumerate(positions_level2):
            node = Circle(radius=node_radius, color=RED, fill_opacity=0.3)
            node.move_to(pos)
            text = Text(str(i+4), font_size=28)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            # Create arrow from parent
            parent_idx = (i + 3 - 1) // n
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+3][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Show binary tree
        self.play(
            Transform(linear_title, nary_title_2),
            *[FadeIn(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeIn(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        self.wait(2)
        
        # Fade out binary tree
        self.play(
            *[FadeOut(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeOut(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        
        # Create n=3 (ternary tree)
        nary_title_3 = Text("n-ary Tree (n = 3)", font_size=32, color=PURPLE)
        nary_title_3.move_to(linear_title.get_center())
        
        n = 3
        tree_nodes = []
        tree_arrows = [None]
        
        # Level 0: node 0 (root)
        node = Circle(radius=node_radius, color=PURPLE, fill_opacity=0.3)
        node.move_to(UP * 2)
        text = Text("1", font_size=28)
        text.move_to(node.get_center())
        tree_nodes.append(VGroup(node, text))
        
        # Level 1: nodes 1, 2, 3
        positions_level1 = [LEFT * 2.5, ORIGIN, RIGHT * 2.5]
        for i, pos in enumerate(positions_level1):
            node = Circle(radius=node_radius, color=PURPLE, fill_opacity=0.3)
            node.move_to(pos + UP * 0.3)
            text = Text(str(i+2), font_size=28)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            parent_idx = (i + 1 - 1) // n  # = 0 for all
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+1][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Level 2: nodes 4-12 (3 children per node from level 1)
        # Children of node 1: positions around x=-2
        # Children of node 2: positions around x=0
        # Children of node 3: positions around x=2
        positions_level2 = [
            LEFT * 3.3 + DOWN * 1.7, LEFT * 2.5 + DOWN * 1.7, LEFT * 1.7 + DOWN * 1.7,  # children of node 1
            LEFT * 0.8 + DOWN * 1.7, ORIGIN + DOWN * 1.7, RIGHT * 0.8 + DOWN * 1.7,     # children of node 2
            RIGHT * 1.7 + DOWN * 1.7, RIGHT * 2.5 + DOWN * 1.7, RIGHT * 3.3 + DOWN * 1.7  # children of node 3
        ]
        
        for i, pos in enumerate(positions_level2):
            node = Circle(radius=0.35, color=PURPLE, fill_opacity=0.3)
            node.move_to(pos)
            text = Text(str(i+5), font_size=24)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            parent_idx = (i + 4 - 1) // n
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+4][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Show ternary tree
        self.play(
            Transform(linear_title, nary_title_3),
            *[FadeIn(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeIn(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        self.wait(2)
        
        # Fade out ternary tree
        self.play(
            *[FadeOut(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeOut(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        
        # Create n=4 (quaternary tree)
        nary_title_4 = Text("n-ary Tree (n = 4)", font_size=32, color=TEAL)
        nary_title_4.move_to(linear_title.get_center())
        
        n = 4
        tree_nodes = []
        tree_arrows = [None]
        
        # Level 0: node 0 (root)
        node = Circle(radius=0.35, color=TEAL, fill_opacity=0.3)
        node.move_to(UP * 2)
        text = Text("1", font_size=24)
        text.move_to(node.get_center())
        tree_nodes.append(VGroup(node, text))
        
        # Level 1: nodes 1, 2, 3, 4
        positions_level1 = [LEFT * 2.7, LEFT * 0.9, RIGHT * 0.9, RIGHT * 2.7]
        for i, pos in enumerate(positions_level1):
            node = Circle(radius=0.35, color=TEAL, fill_opacity=0.3)
            node.move_to(pos + UP * 0.3)
            text = Text(str(i+2), font_size=24)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            parent_idx = (i + 1 - 1) // n  # = 0 for all
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+1][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Level 2: nodes 5-20 (4 children per node from level 1)
        base_y = DOWN * 1.7
        spacing_per_group = 2.0
        positions_level2 = []
        
        # Children of node 1 (around x=-2.5)
        for j in range(4):
            positions_level2.append(LEFT * (3.2 - j * 0.5) + base_y)
        # Children of node 2 (around x=-0.8)
        for j in range(4):
            positions_level2.append(LEFT * (1.4 - j * 0.5) + base_y)
        # Children of node 3 (around x=0.8)
        for j in range(4):
            positions_level2.append(RIGHT * (0.4 + j * 0.5) + base_y)
        # Children of node 4 (around x=2.5)
        for j in range(4):
            positions_level2.append(RIGHT * (2.2 + j * 0.5) + base_y)
        
        for i, pos in enumerate(positions_level2):
            if i % 2 == 0:
                node = Circle(radius=0.25, color=TEAL, fill_opacity=0.3)
                node.move_to(pos)
                text = Text(str(i+6), font_size=20)
                text.move_to(node.get_center())
                tree_nodes.append(VGroup(node, text))
                
                parent_idx = (i + 5 - 1) // n
                arrow = Line(
                    start=tree_nodes[parent_idx][0].get_bottom(),
                    end=tree_nodes[i+5][0].get_top(),
                    color=WHITE
                )
                tree_arrows.append(arrow)
            else:
                node = Circle(radius=0.1, color=BLACK, fill_opacity=0.0)
                node.move_to(pos)
                text = Text("", font_size=20)
                text.move_to(node.get_center())
                tree_nodes.append(VGroup(node, text))
            

        
        # Show quaternary tree
        self.play(
            Transform(linear_title, nary_title_4),
            *[FadeIn(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeIn(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        self.wait(2)
        
        # Fade out quaternary tree
        self.play(
            *[FadeOut(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeOut(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        
        # Create final Binary Tree (n=2)
        binary_title = Text("Binary Tree (n = 2)", font_size=32, color=ORANGE)
        binary_title.move_to(linear_title.get_center())
        
        n = 2
        tree_nodes = []
        tree_arrows = [None]
        
        # Level 0: node 0 (root)
        node = Circle(radius=node_radius, color=ORANGE, fill_opacity=0.3)
        node.move_to(UP * 2)
        text = Text("1", font_size=28)
        text.move_to(node.get_center())
        tree_nodes.append(VGroup(node, text))
        
        # Level 1: nodes 1, 2
        positions_level1 = [LEFT * 1.5, RIGHT * 1.5]
        for i, pos in enumerate(positions_level1):
            node = Circle(radius=node_radius, color=ORANGE, fill_opacity=0.3)
            node.move_to(pos + UP * 0.3)
            text = Text(str(i+2), font_size=28)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            parent_idx = (i + 1 - 1) // n  # = 0 for both
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+1][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Level 2: nodes 3, 4, 5, 6
        positions_level2 = [LEFT * 2.8 + DOWN * 1.7, LEFT * 0.9 + DOWN * 1.7, 
                           RIGHT * 0.9 + DOWN * 1.7, RIGHT * 2.8 + DOWN * 1.7]
        for i, pos in enumerate(positions_level2):
            node = Circle(radius=node_radius, color=ORANGE, fill_opacity=0.3)
            node.move_to(pos)
            text = Text(str(i+4), font_size=28)
            text.move_to(node.get_center())
            tree_nodes.append(VGroup(node, text))
            
            parent_idx = (i + 3 - 1) // n
            arrow = Line(
                start=tree_nodes[parent_idx][0].get_bottom(),
                end=tree_nodes[i+3][0].get_top(),
                color=WHITE
            )
            tree_arrows.append(arrow)
        
        # Show final binary tree
        self.play(
            Transform(linear_title, binary_title),
            *[FadeIn(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeIn(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        self.wait(2)
        
        # Fade out everything
        self.play(
            FadeOut(title),
            FadeOut(linear_title),
            *[FadeOut(tree_nodes[i]) for i in range(len(tree_nodes))],
            *[FadeOut(tree_arrows[i]) for i in range(1, len(tree_arrows))]
        )
        self.wait()
from manim import *
import networkx as nx

# class AutoLayoutGraph(Scene):
class DFSGraph(Scene):
    def construct(self):
        edges = [     [1, 2], [1, 5], [1, 9],     [2, 3], [2, 6], [2, 10],     [3, 1], [3, 4], [3, 7], [3, 11],     [4, 2], [4, 8], [4, 12],     [5, 6], [5, 13],     [6, 3], [6, 7], [6, 14],     [7, 4], [7, 8], [7, 15],     [8, 1], [8, 9], [8, 16],     [9, 5], [9, 10], [9, 13],     [10, 6], [10, 11], [10, 14],     [11, 7], [11, 12], [11, 15],     [12, 8], [12, 16],     [13, 14], [13, 9], [13, 1],     [14, 15], [14, 10],     [15, 16], [15, 11],     [16, 12], [16, 8] ]
        self.clear()
        title = Text("DFS", font_size=40).to_edge(UP)
        divider = Line(title.get_left(), title.get_right())
        divider.next_to(title, DOWN, buff=0.1)
        self.play(Write(title), Write(divider))
        self.play(Write(Text("Time: O(E)\n\nSpace: O(E) ",font_size=33).to_edge(RIGHT,buff=.5)))
        G = nx.Graph()
        G.add_edges_from(edges)
        pos = nx.spring_layout(G, scale=3)
        node_radius = 0.3
        node_mobs = {}
        items = VGroup()
        for name, (x, y) in pos.items():
            point = np.array([x, y, 0])
            circle = Circle(radius=node_radius, stroke_color=BLUE).move_to(point)
            label = Text(str(name), font="Arial", stroke_width=0).scale(0.5).move_to(point)
            # self.add(circle, label)
            items.add(VGroup(circle,label))
            node_mobs[name] = circle
        for u, v in G.edges:
            p1 = node_mobs[u].get_center()
            p2 = node_mobs[v].get_center()
            direction = normalize(p2 - p1)
            start = p1 + direction * node_radius
            end = p2 - direction * node_radius
            line = Line(start, end, color="#888888")
            # self.add(line)
            items.add(line)
        self.play(FadeIn(items))
        self.wait(1)
        visited = set()
        def dfs(node):
            if node in visited:
                return
            visited.add(node)
            self.play(node_mobs[node].animate.set_stroke(RED), run_time=0.5)
            self.wait(0.5)
            for neighbor in G.neighbors(node):
                dfs(neighbor)
        dfs(edges[0][0])
        self.wait(2)
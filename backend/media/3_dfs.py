from manim import *
import networkx as nx

# class AutoLayoutGraph(Scene):
class DFSGraph(Scene):
    def construct(self):
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
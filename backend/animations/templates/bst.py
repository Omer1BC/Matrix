from manim import *
import numpy as np

PALE_GREEN = "#5BEB5B"
DARK_GRAY = "#1E1E1E"


class BSTNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.circle = None
        self.label = None
        self.left_edge = None
        self.right_edge = None
        self.x = 0
        self.y = 0


class BstVisualizer(VGroup):
    def __init__(
        self,
        initial_values=None,
        position=ORIGIN,
        node_radius=0.35,
        level_height=1.2,
        horizontal_spacing=1.5,
        scale_factor=1.0,
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.node_radius = node_radius
        self.level_height = level_height
        self.horizontal_spacing = horizontal_spacing
        self.scale_factor = scale_factor
        self.position = position
        self.root_y = 1.2

        self.root = None
        # value -> (circle, label), "best effort" (duplicates will just overwrite)
        self.node_mobjects = {}
        # node object -> (circle, label), always correct even for duplicates
        self.node_visuals = {}

        self.nodes_group = VGroup()
        self.edges_group = VGroup()

        self.title = Text("BST", font_size=36, color=PALE_GREEN)
        self._scale_at_center(self.title)

        self.command_label = None

        self.add(self.title, self.edges_group, self.nodes_group)
        self.move_to(position)

        self.title.move_to(UP * (self.root_y + 1.5 * self.scale_factor))

        if initial_values:
            for value in initial_values:
                self._insert_node_static(value)

    def _scale_at_center(self, mobj):
        return mobj.scale(self.scale_factor, about_point=mobj.get_center())

    def create(self, run_time=1):
        animations = [Write(self.title)]
        if self.root is not None:
            animations.extend([FadeIn(self.edges_group), FadeIn(self.nodes_group)])
        return AnimationGroup(*animations, run_time=run_time)

    def _update_command_label(self, text, space_complexity="", time_complexity=""):
        if self.command_label is not None:
            self.remove(self.command_label)

        main_text = Text(text, font_size=28, color=PALE_GREEN)

        texts = [main_text]
        if time_complexity:
            time_text = Text(f"Time: {time_complexity}", font_size=20, color=PALE_GREEN)
            texts.append(time_text)
        if space_complexity:
            space_text = Text(
                f"Space: {space_complexity}", font_size=20, color=PALE_GREEN
            )
            texts.append(space_text)

        self.command_label = VGroup(*texts)
        self.command_label.arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        self.command_label.move_to(RIGHT * 4 + UP * 0.5)
        self._scale_at_center(self.command_label)
        self.add(self.command_label)

    def _calculate_positions(self, node, x=0, y=None, level=0):
        if node is None:
            return
        if y is None:
            y = self.root_y

        horizontal_gap = self.horizontal_spacing / (2**level)

        if node.left:
            self._calculate_positions(
                node.left,
                x - horizontal_gap,
                y - self.level_height * self.scale_factor,
                level + 1,
            )

        node.x = x
        node.y = y

        if node.right:
            self._calculate_positions(
                node.right,
                x + horizontal_gap,
                y - self.level_height * self.scale_factor,
                level + 1,
            )

    def _find_node(self, value, node=None):
        if node is None:
            node = self.root
        if node is None:
            return None
        if node.value == value:
            return node
        if value < node.value:
            if node.left is None:
                return None
            return self._find_node(value, node.left)
        else:
            if node.right is None:
                return None
            return self._find_node(value, node.right)

    def _find_parent(self, value, node=None, parent=None):
        if node is None:
            node = self.root
            parent = None
        if node is None:
            return None
        if node.value == value:
            return parent
        if value < node.value:
            if node.left is None:
                return None
            return self._find_parent(value, node.left, node)
        else:
            if node.right is None:
                return None
            return self._find_parent(value, node.right, node)

    def _find_parent_of_node(self, target_node):
        if target_node is None or self.root is None or target_node is self.root:
            return None

        visited = set()
        stack = [(self.root, None)]

        while stack:
            node, parent = stack.pop()
            if node is None:
                continue
            if id(node) in visited:
                continue
            visited.add(id(node))

            if node is target_node:
                return parent

            if node.left is not None:
                stack.append((node.left, node))
            if node.right is not None:
                stack.append((node.right, node))

        return None

    def _insert_node_static(self, value):
        if self.root is None:
            self.root = BSTNode(value)
            node = self.root
            parent = None
        else:
            node, parent = self._insert_helper(self.root, value)
        self._calculate_positions(self.root)
        self._create_node_visuals(node, parent_override=parent)

    def _insert_helper(self, node, value, parent=None):
        if value <= node.value:
            if node.left is None:
                node.left = BSTNode(value)
                return node.left, node
            else:
                return self._insert_helper(node.left, value, node)
        else:
            if node.right is None:
                node.right = BSTNode(value)
                return node.right, node
            else:
                return self._insert_helper(node.right, value, node)

    def _edge_endpoints(self, parent, child):
        parent_pos = np.array([parent.x, parent.y, 0.0])
        child_pos = np.array([child.x, child.y, 0.0])
        direction = child_pos - parent_pos
        distance = np.linalg.norm(direction)
        if distance > 0:
            direction = direction / distance
            offset = self.node_radius * self.scale_factor
            start = parent_pos + direction * offset
            end = child_pos - direction * offset
        else:
            start = parent_pos
            end = child_pos
        return start, end

    def _create_node_visuals(self, node, parent_override=None):
        circle = Circle(
            radius=self.node_radius,
            color=PALE_GREEN,
            fill_opacity=0,
            stroke_width=3,
        )
        circle.move_to([node.x, node.y, 0])
        self._scale_at_center(circle)

        label = Text(str(node.value), font_size=24, color=WHITE)
        label.move_to(circle.get_center())
        self._scale_at_center(label)

        node.circle = circle
        node.label = label

        self.nodes_group.add(circle, label)
        self.node_mobjects[node.value] = (circle, label)
        self.node_visuals[node] = (circle, label)

        parent = parent_override if parent_override is not None else self._find_parent_of_node(node)
        if parent and parent.circle:
            self._create_edge(parent, node)

    def _create_edge(self, parent, child):
        start, end = self._edge_endpoints(parent, child)
        edge = Line(start, end, color=PALE_GREEN, stroke_width=3)

        if child is parent.left:
            parent.left_edge = edge
        elif child is parent.right:
            parent.right_edge = edge

        self.edges_group.add(edge)
        return edge

    def _get_traversal_path_for_insertion(self, value):
        path = []
        current = self.root
        while current is not None:
            path.append(current)
            if value <= current.value:
                if current.left is None:
                    break
                current = current.left
            else:
                if current.right is None:
                    break
                current = current.right
        return path

    def _get_traversal_path(self, value):
        path = []
        current = self.root
        while current is not None:
            path.append(current)
            if value == current.value:
                break
            elif value < current.value:
                current = current.left
            else:
                current = current.right
        return path

    def insert(self, value, run_time=5):
        self._update_command_label(
            f"insert({value})", time_complexity="O(log n)", space_complexity="O(log n)"
        )

        traversal_path = self._get_traversal_path_for_insertion(value) if self.root else []

        if self.root is None:
            self.root = BSTNode(value)
            new_node = self.root
            parent = None
        else:
            new_node, parent = self._insert_helper(self.root, value)

        old_positions = {}
        self._store_positions(self.root, old_positions)
        self._calculate_positions(self.root)

        reposition_anims = self._get_reposition_animations(old_positions)

        circle = Circle(
            radius=self.node_radius,
            color=PALE_GREEN,
            fill_opacity=0,
            stroke_width=3,
        )
        circle.move_to([new_node.x, new_node.y, 0])
        self._scale_at_center(circle)

        label = Text(str(value), font_size=24, color=WHITE)
        label.move_to(circle.get_center())
        self._scale_at_center(label)

        new_node.circle = circle
        new_node.label = label

        self.node_mobjects[value] = (circle, label)
        self.node_visuals[new_node] = (circle, label)

        highlight_circles = []
        for node in traversal_path:
            highlight = Circle(
                radius=self.node_radius,
                color=YELLOW,
                stroke_width=4,
                fill_opacity=0,
            )
            highlight.move_to([node.x, node.y, 0])
            self._scale_at_center(highlight)
            highlight.set_stroke(opacity=0)
            self.add(highlight)
            highlight_circles.append(highlight)

        traversal_anims = [
            highlight.animate.set_stroke(opacity=1) for highlight in highlight_circles
        ]

        if traversal_anims:
            traversal_sequence = Succession(
                *[AnimationGroup(anim, run_time=3) for anim in traversal_anims]
            )
        else:
            traversal_sequence = Wait(0.1)

        initial_anims = [FadeIn(self.command_label)]
        initial_anims.extend(reposition_anims)

        circle.set_stroke(PALE_GREEN, opacity=0)
        label.set_opacity(0)
        self.nodes_group.add(circle, label)

        edge_anims = []
        if parent and parent.circle:
            edge = self._create_edge(parent, new_node)
            edge.set_opacity(0)
            edge_anims.append(edge.animate.set_opacity(1))

        insert_group = AnimationGroup(
            circle.animate.set_stroke(PALE_GREEN, opacity=1),
            label.animate.set_opacity(1),
            *edge_anims,
        )

        fade_highlights = AnimationGroup(
            *[FadeOut(h) for h in highlight_circles], run_time=1.0
        )

        return Succession(
            AnimationGroup(*initial_anims),
            traversal_sequence,
            Wait(1.0),
            insert_group,
            Wait(1.0),
            fade_highlights if highlight_circles else Wait(0.1),
            FadeOut(self.command_label),
            run_time=run_time,
        )

    def _store_positions(self, node, positions_dict):
        if node is None:
            return
        positions_dict[node] = (node.x, node.y)
        self._store_positions(node.left, positions_dict)
        self._store_positions(node.right, positions_dict)

    def _get_reposition_animations(self, old_positions):
        animations = []
        for node, (old_x, old_y) in old_positions.items():
            if node is None or node.circle is None:
                continue

            if node.x != old_x or node.y != old_y:
                new_pos = np.array([node.x, node.y, 0.0])
                animations.append(node.circle.animate.move_to(new_pos))
                animations.append(node.label.animate.move_to(new_pos))

            parent = self._find_parent_of_node(node)
            if parent and parent.circle:
                edge = None
                if parent.left is node:
                    edge = parent.left_edge
                elif parent.right is node:
                    edge = parent.right_edge
                if edge:
                    start, end = self._edge_endpoints(parent, node)
                    animations.append(edge.animate.put_start_and_end_on(start, end))
        return animations

    def search(self, value, run_time=5):
        self._update_command_label(
            f"search({value})", time_complexity="O(log n)", space_complexity="O(log n)"
        )

        traversal_path = self._get_traversal_path(value)
        node = self._find_node(value)

        highlight_circles = []
        for trav_node in traversal_path:
            highlight = Circle(
                radius=self.node_radius,
                color=YELLOW,
                stroke_width=4,
                fill_opacity=0,
            )
            highlight.move_to([trav_node.x, trav_node.y, 0])
            self._scale_at_center(highlight)
            highlight.set_stroke(opacity=0)
            self.add(highlight)
            highlight_circles.append(highlight)

        traversal_anims = [
            highlight.animate.set_stroke(opacity=1) for highlight in highlight_circles
        ]
        if traversal_anims:
            traversal_sequence = Succession(
                *[AnimationGroup(anim, run_time=3) for anim in traversal_anims]
            )
        else:
            traversal_sequence = Wait(0.1)

        if node is None:
            error_text = Text("Node Not Found!", color=RED, font_size=24)
            error_text.move_to(RIGHT * 4 + DOWN * 0.5)
            self._scale_at_center(error_text)
            self.add(error_text)

            fade_highlights = (
                AnimationGroup(*[FadeOut(h) for h in highlight_circles], run_time=1.0)
                if highlight_circles
                else Wait(0.1)
            )

            return Succession(
                FadeIn(self.command_label),
                traversal_sequence,
                Wait(1.0),
                Wait(1.2),
                fade_highlights,
                AnimationGroup(FadeOut(self.command_label), FadeOut(error_text)),
                run_time=run_time,
            )

        target_circle, target_label = self.node_visuals[node]

        show_command_and_traversal = Succession(
            FadeIn(self.command_label),
            traversal_sequence,
        )

        highlight_found = AnimationGroup(
            target_circle.animate.set_fill(ORANGE, opacity=0.8),
            run_time=1.2,
        )

        revert_animations = [target_circle.animate.set_fill(opacity=0)]
        revert_animations.extend([FadeOut(h) for h in highlight_circles])
        revert_all = AnimationGroup(*revert_animations, run_time=1.0)

        return Succession(
            show_command_and_traversal,
            Wait(1.0),
            highlight_found,
            Wait(1.0),
            revert_all,
            Wait(0.5),
            FadeOut(self.command_label),
            run_time=run_time,
        )

    def delete(self, value, run_time=5):
        traversal_path = self._get_traversal_path(value)
        node = self._find_node(value)

        self._update_command_label(
            f"delete({value})", time_complexity="O(log n)", space_complexity="O(log n)"
        )

        highlight_circles = []
        for trav_node in traversal_path:
            highlight = Circle(
                radius=self.node_radius,
                color=YELLOW,
                stroke_width=4,
                fill_opacity=0,
            )
            highlight.move_to([trav_node.x, trav_node.y, 0])
            self._scale_at_center(highlight)
            highlight.set_stroke(opacity=0)
            self.add(highlight)
            highlight_circles.append(highlight)

        traversal_anims = [
            highlight.animate.set_stroke(opacity=1) for highlight in highlight_circles
        ]
        if traversal_anims:
            traversal_sequence = Succession(
                *[AnimationGroup(anim, run_time=3) for anim in traversal_anims]
            )
        else:
            traversal_sequence = Wait(0.1)

        if node is None:
            error_text = Text("Node Not Found!", color=RED, font_size=24)
            error_text.move_to(RIGHT * 4 + DOWN * 0.5)
            self._scale_at_center(error_text)
            self.add(error_text)

            fade_highlights = (
                AnimationGroup(*[FadeOut(h) for h in highlight_circles], run_time=1.0)
                if highlight_circles
                else Wait(0.1)
            )

            return Succession(
                FadeIn(self.command_label),
                traversal_sequence,
                Wait(1.0),
                Wait(1.2),
                fade_highlights,
                AnimationGroup(FadeOut(self.command_label), FadeOut(error_text)),
                run_time=run_time,
            )

        target_circle, target_label = self.node_visuals[node]
        has_two_children = node.left is not None and node.right is not None

        show_command_and_traversal = Succession(
            FadeIn(self.command_label),
            traversal_sequence,
        )

        if has_two_children:
            predecessor = self._find_max(node.left)
            pred_circle, pred_label = self.node_visuals[predecessor]

            highlight_pred = AnimationGroup(
                pred_circle.animate.set_fill(ORANGE, opacity=0.8),
                run_time=1.2,
            )

            new_label = Text(str(predecessor.value), font_size=24, color=WHITE)
            new_label.move_to(target_circle.get_center())
            self._scale_at_center(new_label)

            swap_anim = AnimationGroup(
                Transform(target_label, new_label),
                target_circle.animate.set_fill(ORANGE, opacity=0.8),
                run_time=1.2,
            )

            mark_for_deletion = pred_circle.animate.set_fill(
                RED, opacity=0.8
            ).set_run_time(1.2)

            edges_to_remove = []

            pred_parent = self._find_parent_of_node(predecessor)
            if pred_parent:
                if pred_parent.left is predecessor and pred_parent.left_edge:
                    edges_to_remove.append(pred_parent.left_edge)
                    pred_parent.left_edge = None
                elif pred_parent.right is predecessor and pred_parent.right_edge:
                    edges_to_remove.append(pred_parent.right_edge)
                    pred_parent.right_edge = None

            if predecessor.left_edge is not None:
                edges_to_remove.append(predecessor.left_edge)
                predecessor.left_edge = None
            if predecessor.right_edge is not None:
                edges_to_remove.append(predecessor.right_edge)
                predecessor.right_edge = None

            pred_replacement_child = predecessor.left

            self.root = self._delete_node(self.root, value, depth=0)

            old_positions = {}
            if self.root:
                self._store_positions(self.root, old_positions)
                self._calculate_positions(self.root)

            fade_list = [FadeOut(pred_circle), FadeOut(pred_label)]
            for edge in edges_to_remove:
                if edge is not None:
                    fade_list.append(FadeOut(edge))
                    if edge in self.edges_group:
                        self.edges_group.remove(edge)

            new_edge_anims = []
            if pred_parent and pred_replacement_child:
                new_edge = self._create_edge(pred_parent, pred_replacement_child)
                new_edge.set_opacity(0)
                new_edge_anims.append(new_edge.animate.set_opacity(1))

            reposition_anims = self._get_reposition_animations(old_positions)
            combined_anims = fade_list + reposition_anims + new_edge_anims
            fade_and_reposition = (
                AnimationGroup(*combined_anims, run_time=1.5)
                if combined_anims
                else Wait(0.1)
            )

            revert_color = target_circle.animate.set_fill(opacity=0).set_run_time(1.0)

            self.nodes_group.remove(pred_circle, pred_label)

            if predecessor in self.node_visuals:
                del self.node_visuals[predecessor]
            if predecessor.value in self.node_mobjects:
                del self.node_mobjects[predecessor.value]

            if node in self.node_visuals:
                del self.node_visuals[node]
            if value in self.node_mobjects:
                del self.node_mobjects[value]

            self.node_mobjects[predecessor.value] = (target_circle, target_label)
            self.node_visuals[node] = (target_circle, target_label)

            fade_highlights = AnimationGroup(
                *[FadeOut(h) for h in highlight_circles], run_time=1.0
            )

            return Succession(
                show_command_and_traversal,
                Wait(1.0),
                highlight_pred,
                Wait(1.0),
                swap_anim,
                Wait(1.0),
                mark_for_deletion,
                Wait(1.0),
                fade_and_reposition,
                revert_color,
                Wait(1.0),
                fade_highlights,
                Wait(0.5),
                FadeOut(self.command_label),
                run_time=run_time,
            )

        else:
            highlight_anim = AnimationGroup(
                target_circle.animate.set_fill(RED, opacity=0.8),
                run_time=1.2,
            )

            edges_to_remove = []

            target_parent = self._find_parent_of_node(node)
            if target_parent:
                if target_parent.left is node and target_parent.left_edge:
                    edges_to_remove.append(target_parent.left_edge)
                    target_parent.left_edge = None
                elif target_parent.right is node and target_parent.right_edge:
                    edges_to_remove.append(target_parent.right_edge)
                    target_parent.right_edge = None

            if node.left_edge is not None:
                edges_to_remove.append(node.left_edge)
                node.left_edge = None
            if node.right_edge is not None:
                edges_to_remove.append(node.right_edge)
                node.right_edge = None

            replacement_child = node.left if node.left else node.right

            self.root = self._delete_node(self.root, value, depth=0)

            old_positions = {}
            if self.root:
                self._store_positions(self.root, old_positions)
                self._calculate_positions(self.root)

            fade_list = [FadeOut(target_circle), FadeOut(target_label)]
            for edge in edges_to_remove:
                if edge is not None:
                    fade_list.append(FadeOut(edge))
                    if edge in self.edges_group:
                        self.edges_group.remove(edge)

            new_edge_anims = []
            if target_parent and replacement_child:
                new_edge = self._create_edge(target_parent, replacement_child)
                new_edge.set_opacity(0)
                new_edge_anims.append(new_edge.animate.set_opacity(1))

            reposition_anims = self._get_reposition_animations(old_positions)
            combined_anims = fade_list + reposition_anims + new_edge_anims
            fade_and_reposition = (
                AnimationGroup(*combined_anims, run_time=1.5)
                if combined_anims
                else Wait(0.1)
            )

            self.nodes_group.remove(target_circle, target_label)

            if node in self.node_visuals:
                del self.node_visuals[node]
            if value in self.node_mobjects:
                del self.node_mobjects[value]

            fade_highlights = AnimationGroup(
                *[FadeOut(h) for h in highlight_circles], run_time=1.0
            )

            return Succession(
                show_command_and_traversal,
                Wait(1.0),
                highlight_anim,
                Wait(1.0),
                fade_and_reposition,
                Wait(1.0),
                fade_highlights,
                Wait(0.5),
                FadeOut(self.command_label),
                run_time=run_time,
            )

    def _delete_node(self, node, value, depth=0):
        if depth > 100:
            print(
                f"RECURSION ERROR: depth={depth}, value={value}, node.value={node.value if node else 'None'}"
            )
            raise RecursionError(f"Max recursion depth exceeded while deleting {value}")

        if node is None:
            return None

        if value < node.value:
            result = self._delete_node(node.left, value, depth + 1)
            node.left = result
            if node.left is node:
                node.left = None
        elif value > node.value:
            result = self._delete_node(node.right, value, depth + 1)
            node.right = result
            if node.right is node:
                node.right = None
        else:
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            max_node = self._find_max(node.left)
            node.value = max_node.value

            result = self._delete_node(node.left, max_node.value, depth + 1)
            node.left = result
            if node.left is node:
                node.left = None

        return node

    def _find_max(self, node):
        current = node
        while current.right:
            current = current.right
        return current

    def _find_min(self, node):
        current = node
        while current.left:
            current = current.left
        return current


class BstExample(Scene):
    def construct(self):
        self.camera.background_color = DARK_GRAY
        bst = BstVisualizer(initial_values=[10, 5, 3, 4, 2, 7, 8], scale_factor=1.0)

        self.play(bst.create())
        self.wait(0.75)

        self.play(bst.insert(5))
        self.wait(0.75)

        self.play(bst.search(5))
        self.wait(0.75)

        self.play(bst.delete(5))
        self.wait(0.75)

        self.play(bst.delete(5))
        self.wait(0.75)

        self.play(bst.search(5))
        self.wait(0.75)

        self.play(bst.delete(5))
        self.wait(0.75)

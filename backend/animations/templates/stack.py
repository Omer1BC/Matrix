from manim import *

class StackVisualizer(VGroup):
    def __init__(
        self,
        max_size=10,
        initial_values=None,
        position=ORIGIN,
        box_width=2,
        box_height=0.8,
        scale_factor=0.7,
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.max_size = max_size
        self.box_width = box_width
        self.box_height = box_height
        self.scale_factor = scale_factor

        self.stack_data = []
        self.boxes = VGroup()
        self.labels = VGroup()

        def _scale_at_center(mobj):
            """Scale around center to preserve positioning."""
            return mobj.scale(self.scale_factor, about_point=mobj.get_center())

        self._scale_at_center = _scale_at_center

        self.base = Rectangle(
            width=box_width,
            height=box_height * max_size,
            stroke_color=BLUE,
            stroke_width=3,
            fill_opacity=0,
        )
        self._scale_at_center(self.base)

        self.title = Text("Stack", font_size=36).next_to(self.base, UP, buff=0.3)
        self._scale_at_center(self.title)

        self.command_label = None

        self.add(self.base, self.title, self.boxes, self.labels)
        self.move_to(position)

        if initial_values:
            for value in initial_values:
                if len(self.stack_data) < self.max_size:
                    self._add_element_static(value)

    def create(self, run_time=1):
        animations = [Create(self.base), Write(self.title)]
        if len(self.stack_data) > 0:
            animations.extend([FadeIn(self.boxes), FadeIn(self.labels)])
        return AnimationGroup(*animations, run_time=run_time)

    def _update_command_label(self, text):
        if self.command_label is not None:
            self.remove(self.command_label)
        self.command_label = Text(text, font_size=28, color=YELLOW)
       
        self.command_label.next_to(self.base, RIGHT, buff=0.8)
        
        self._scale_at_center(self.command_label)
        self.add(self.command_label)

    def _add_element_static(self, value):
        if len(self.stack_data) >= self.max_size:
            return

        self.stack_data.append(value)
        index = len(self.stack_data) - 1

        box = Rectangle(
            width=self.box_width - 0.1,
            height=self.box_height - 0.1,
            fill_color=GREEN,
            fill_opacity=0.6,
            stroke_color=WHITE,
            stroke_width=2,
        )

        y_offset = (
            self.base.get_bottom()[1] + (self.box_height / 2) * self.scale_factor
            + index * self.box_height * self.scale_factor
        )
        box.move_to([self.base.get_center()[0], y_offset, 0])
        self._scale_at_center(box)

        label = Text(str(value), font_size=30, color=WHITE)
        label.move_to(box.get_center())
        self._scale_at_center(label)

        self.boxes.add(box)
        self.labels.add(label)

    def push(self, value, run_time=1):
        if len(self.stack_data) >= self.max_size:
            self._update_command_label("push() - OVERFLOW")
            error_text = Text("Stack Overflow!", color=RED, font_size=24)
            error_text.next_to(self.base, RIGHT, buff=0.5)
            self._scale_at_center(error_text)
            return AnimationGroup(
                FadeIn(self.command_label),
                FadeIn(error_text),
                Wait(0.5),
                FadeOut(error_text),
                FadeOut(self.command_label),
                run_time=run_time,
            )

        self._update_command_label(f"push({value})")

        self.stack_data.append(value)
        index = len(self.stack_data) - 1

        box = Rectangle(
            width=self.box_width - 0.1,
            height=self.box_height - 0.1,
            fill_color=GREEN,
            fill_opacity=0.6,
            stroke_color=WHITE,
            stroke_width=2,
        )

        y_offset = (
            self.base.get_bottom()[1] + (self.box_height / 2) * self.scale_factor
            + index * self.box_height * self.scale_factor
        )
        box.move_to([self.base.get_center()[0], y_offset, 0])
        self._scale_at_center(box)

        label = Text(str(value), font_size=30, color=WHITE)
        label.move_to(box.get_center())
        self._scale_at_center(label)

        self.boxes.add(box)
        self.labels.add(label)

        start_pos = box.get_center() + UP * (2 * self.scale_factor)
        box.move_to(start_pos)
        label.move_to(start_pos)

        animations = [
            FadeIn(self.command_label),
            box.animate.move_to([self.base.get_center()[0], y_offset, 0]),
            label.animate.move_to([self.base.get_center()[0], y_offset, 0]),
        ]

        return Succession(
            AnimationGroup(*animations),
            Wait(0.3),
            FadeOut(self.command_label),
            run_time=run_time,
        )

    def pop(self, run_time=1):
        if len(self.stack_data) == 0:
            self._update_command_label("pop() - UNDERFLOW")
            error_text = Text("Stack Underflow!", color=RED, font_size=24)
            error_text.next_to(self.base, RIGHT, buff=0.5)
            self._scale_at_center(error_text)
            return AnimationGroup(
                FadeIn(self.command_label),
                FadeIn(error_text),
                Wait(0.5),
                FadeOut(error_text),
                FadeOut(self.command_label),
                run_time=run_time,
            )

        value = self.stack_data[-1]
        self._update_command_label(f"pop() → {value}")
        self.stack_data.pop()

        top_box = self.boxes[-1]
        top_label = self.labels[-1]

        highlight_anim = AnimationGroup(
            FadeIn(self.command_label),
            top_box.animate.set_fill(RED, opacity=0.8),
        )

        exit_animations = [
            top_box.animate.shift(UP * (2 * self.scale_factor)).set_opacity(0),
            top_label.animate.shift(UP * (2 * self.scale_factor)).set_opacity(0),
        ]

        self.boxes.remove(top_box)
        self.labels.remove(top_label)

        return Succession(
            highlight_anim,
            Wait(0.2),
            AnimationGroup(*exit_animations),
            Wait(0.3),
            FadeOut(self.command_label),
            run_time=run_time,
        )

    def peek(self, run_time=1):
        if len(self.stack_data) == 0:
            self._update_command_label("peek() - EMPTY")
            error_text = Text("Stack Empty!", color=RED, font_size=24)
            error_text.next_to(self.base, RIGHT, buff=0.5)
            self._scale_at_center(error_text)
            return Succession(
                FadeIn(self.command_label),
                FadeIn(error_text),
                Wait(0.4),
                FadeOut(error_text),
                FadeOut(self.command_label),
                run_time=run_time,
            )

        value = self.stack_data[-1]
        self._update_command_label(f"peek() → {value}")
        top_box = self.boxes[-1]

        highlight_rect = Rectangle(
            width=self.box_width - 0.05,
            height=self.box_height - 0.05,
            stroke_color=YELLOW,
            stroke_width=6,
            fill_opacity=0,
        ).move_to(top_box.get_center())
        self._scale_at_center(highlight_rect)

        return Succession(
            FadeIn(self.command_label, run_time=0.2),
            AnimationGroup(
                Create(highlight_rect),
                top_box.animate(run_time=0.3).set_fill(ORANGE, opacity=0.8),
            ),
            Wait(0.3),
            AnimationGroup(
                top_box.animate(run_time=0.3).set_fill(GREEN, opacity=0.6),
                FadeOut(highlight_rect, run_time=0.3),
            ),
            FadeOut(self.command_label, run_time=0.2),
            run_time=run_time,
        )

    def clear(self, run_time=1):
        if len(self.stack_data) == 0:
            return Wait(0.2)

        self._update_command_label("clear()")

        boxes_to_clear = list(self.boxes)
        labels_to_clear = list(self.labels)

        element_animations = []
        for box, label in zip(reversed(boxes_to_clear), reversed(labels_to_clear)):
            element_animations.append(
                AnimationGroup(
                    box.animate.shift(UP * (0.5 * self.scale_factor)).set_opacity(0),
                    label.animate.shift(UP * (0.5 * self.scale_factor)).set_opacity(0),
                    lag_ratio=0.1,
                )
            )

        return Succession(
            FadeIn(self.command_label),
            LaggedStart(*element_animations, lag_ratio=0.1),
            Wait(0.3),
            FadeOut(self.command_label),
            run_time=run_time,
            rate_func=smooth,
            remover=True,
        )


class StackExample(Scene):
    def construct(self):
        stack = StackVisualizer(
            max_size=6,
            initial_values=[5, 10, 15],
            position=ORIGIN,
            scale_factor=0.7,
        )

        self.play(stack.create())
        self.wait(0.75)

        self.play(stack.push(20))
        self.wait(0.75)

        self.play(stack.peek())
        self.wait(0.75)

        self.play(stack.pop())
        self.wait(0.75)

        self.play(stack.pop())
        self.wait(0.75)

        self.play(stack.clear())
        self.wait(1)

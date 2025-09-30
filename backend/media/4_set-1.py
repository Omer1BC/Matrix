from manim import *

class Set(Scene):
    def construct(self):
        numbers = [1,2,3,2,5]
        #List
        self.clear()
        lBrace,rBrace=Text("{"),Text("}")
        title=Text("Sets",font_size=48)
        underline=Line(LEFT,RIGHT).match_width(title).next_to(title,DOWN,buff=0.1)
        title_group=VGroup(title,underline).to_edge(UP)
        self.play(FadeIn(title),FadeIn(underline))
        cells=VGroup()
        for num in numbers:
            box=Square(side_length=1,stroke_color=BLUE)
            txt=Text(str(num),font_size=36,fill_color=YELLOW).move_to(box.get_center())
            cell=VGroup(box,txt)
            cells.add(cell)
        cells.arrange(RIGHT,buff=0)
        set_contents=VGroup(lBrace)
        set_contents.arrange(RIGHT, buff=0.3)
        set_contents.next_to(cells[0],LEFT + 2*UP).shift(RIGHT*.25)
        end = Text("}").next_to(set_contents[-1],RIGHT,buff=.5)
        self.play(FadeIn(Text("Set:").next_to(set_contents,LEFT,buff=0.5)),FadeIn(set_contents),FadeIn(end))
        self.play(*[FadeIn(c) for c in cells])
        complexity_text=VGroup(
            Text("Insert : O(1)",font_size=24),
            Text("Remove : O(1)",font_size=24),
            Text("Search : O(1)",font_size=24)
        ).arrange(DOWN,aligned_edge=LEFT).to_edge(RIGHT)
        self.play(FadeIn(complexity_text))
        #set
        seen= {}
        for i,num in enumerate(numbers):
            box,txt=cells[i]
            new_elem=Text(str(num),font_size=36).next_to(set_contents[-1],RIGHT,buff=.5)
            if num not in seen:
                set_contents.add(new_elem)
                self.play(box.animate.set_fill(GREEN,opacity=0.5),end.animate.next_to(new_elem,RIGHT,buff=.5),FadeIn(new_elem),run_time=1)
                seen[num] = new_elem
            else:
                self.play(box.animate.set_fill(GREEN,opacity=0.5),seen[num].animate.set_color(RED),txt.animate.set_color(RED),run_time=1)
            self.play(box.animate.set_fill(opacity=0))
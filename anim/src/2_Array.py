
from manim import *
from collections import *
class VGroupArray(VGroup):
    def __init__(self, n, **kwargs):
        super().__init__(**kwargs)
        self.cells=VGroup()
        for i in range(n):
            cell=Rectangle(width=1,height=1)
            num=Text(str(i)).scale(0.5).move_to(cell.get_center())
            self.cells.add(VGroup(cell,num))
        self.cells.arrange(RIGHT,buff=0.1)
        self.add(self.cells)
        first_cell=self.cells[0][0]
        self.arrow=Arrow(start=first_cell.get_top()+UP*0.1,end=first_cell.get_top()+DOWN*0.1)
        self.add(self.arrow)
        self._idx=0
    def next(self):
        if self._idx+1>=len(self.cells):return None
        self._idx+=1
        target=self.cells[self._idx][0]
        return self.arrow.animate.move_to(target.get_top()+UP*0.1)
    
class Array(Scene):
    def construct(self):
        arr = VGroupArray(5)
        self.play(FadeIn(arr))



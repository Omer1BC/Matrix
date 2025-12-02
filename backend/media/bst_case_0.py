from manim import *
import sys
from pathlib import Path
sys.path.append(r"/app/animations/templates")
from bst import BstVisualizer

class BstExample(Scene):
    def construct(self):
        bst = BstVisualizer(initial_values=[5, 3, 7], scale_factor=0.7)
        self.play(bst.create()); self.wait(0.5)
        self.play(bst.delete(3)); self.wait(0.75)

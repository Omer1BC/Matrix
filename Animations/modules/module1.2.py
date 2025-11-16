from manim import *

"""
HOW TO USE ACTUAL IMAGE FRAMES:

1. Save your frame images in the same directory as this script or provide full paths
2. Replace the create_frame_box() calls with ImageMobject():

   Instead of:
       first_frame = self.create_frame_box().move_to(position)
   
   Use:
       first_frame = ImageMobject("path/to/first_frame.png").scale(0.3).move_to(position)
   
   Example with actual files:
       first_frame = ImageMobject("frame_0000.png").scale(0.3).move_to(timeline.get_start() + UP * 1.5)
       target_frame = ImageMobject("frame_2400.png").scale(0.3).move_to(target_pos + UP * 1.5)
       last_frame = ImageMobject("frame_8400.png").scale(0.3).move_to(timeline.get_end() + UP * 1.5)

3. The scale() parameter controls the size - adjust as needed (0.3 = 30% of original size)
4. Supported formats: PNG, JPG, JPEG, GIF

For the movie placeholder in setup_intro(), replace:
    movie_box = Rectangle(width=3, height=2, color=BLUE).move_to(ORIGIN)
    movie_text = Text("Across the\\nSpiderverse", font_size=20).move_to(movie_box)
    movie = VGroup(movie_box, movie_text)

With:
    movie = ImageMobject("spiderverse_poster.png").scale(0.5).move_to(ORIGIN)

And for the target frame in show_target(), replace:
    target_box = Rectangle(width=2, height=1.5, color=RED).move_to(ORIGIN)
    target_text = Text("Target Frame\\n40:00", font_size=20).move_to(target_box)
    target = VGroup(target_box, target_text)

With:
    target = ImageMobject("frame_2400.png").scale(0.5).move_to(ORIGIN)

IMPORTANT NOTE ABOUT IMAGES:
When using images with different dimensions, DO NOT use Transform() as it requires 
matching pixel array shapes. Instead, use FadeOut() and FadeIn() separately:
    
    # Instead of: self.play(Transform(self.movie, target))
    # Use:
    self.play(FadeOut(self.movie), FadeIn(target))
    self.movie = target  # Update the reference

This is already implemented in the show_target() method.
"""

class SearchComparison(Scene):
    def construct(self):
        # Setup scene with two characters and movie image
        self.setup_intro()
        self.wait(2)
        
        # Show target frame
        self.show_target()
        self.wait(2)
        
        # Omer's linear search strategy
        self.omers_strategy()
        self.wait(2)
        
        # Gino's binary search strategy
        self.ginos_strategy()
        self.wait(2)
    
    def setup_intro(self):
        """Setup with two stick figures and movie reference"""
        # Create stick figures
        omer = self.create_stick_figure().shift(LEFT * 4)
        gino = self.create_stick_figure().shift(RIGHT * 4)
        
        # Labels
        omer_label = Text("Omer", font_size=24).next_to(omer, DOWN)
        gino_label = Text("Gino", font_size=24).next_to(gino, DOWN)
        
        # Movie poster
        movie = ImageMobject("module1.2_images/movie_poster.jpg").move_to(ORIGIN)
        
        self.play(
            Create(omer),
            Create(gino),
            Write(omer_label),
            Write(gino_label),
            FadeIn(movie)
        )
        
        self.omer = omer
        self.gino = gino
        self.omer_label = omer_label
        self.gino_label = gino_label
        self.movie = movie
    
    def show_target(self):
        """Replace movie with target frame"""
        target = ImageMobject("module1.2_images/movie_target_frame.png").scale(0.3).move_to(ORIGIN)
        
        # Use FadeOut/FadeIn instead of Transform to avoid dimension mismatch with images
        self.play(FadeOut(self.movie), FadeIn(target))
        self.movie = target  # Update reference
        self.wait(1)
        
        # Clear the scene for strategy visualization
        self.play(
            FadeOut(self.omer),
            FadeOut(self.gino),
            FadeOut(self.omer_label),
            FadeOut(self.gino_label),
            FadeOut(self.movie)
        )
    
    def omers_strategy(self):
        """Visualize Omer's linear search"""
        # Title
        title = Text("Omer's Strategy: Linear Search", font_size=32).to_edge(UP)
        self.play(Write(title))
        
        # Recreate Omer on left side
        omer = self.create_stick_figure().scale(0.7).to_edge(LEFT).shift(DOWN * 0.5)
        omer_label = Text("Omer", font_size=20).next_to(omer, DOWN, buff=0.2)
        self.play(Create(omer), Write(omer_label))
        
        # Create timeline
        timeline = Line(LEFT * 5 + DOWN * 2, RIGHT * 5 + DOWN * 2, color=WHITE)
        self.play(Create(timeline))
        
        # Dots at beginning and end of timeline
        start_dot = Dot(timeline.get_start(), color=WHITE, radius=0.06)
        end_dot = Dot(timeline.get_end(), color=WHITE, radius=0.06)
        self.play(Create(start_dot), Create(end_dot))
        
        # Timeline labels
        start_label = Text("0:00:00", font_size=16).next_to(timeline.get_start(), DOWN, buff=0.2)
        end_label = Text("2:20:00", font_size=16).next_to(timeline.get_end(), DOWN, buff=0.2)
        self.play(Write(start_label), Write(end_label))
        
        # Target position (40 minutes into 140 minutes = 40/140 ≈ 0.286 of the way)
        target_ratio = 40 / 140
        target_pos = timeline.point_from_proportion(target_ratio)
        
        # Red dot for target
        target_dot = Dot(target_pos, color=RED, radius=0.08)
        target_label = Text("40:00", font_size=14, color=RED).next_to(target_dot, UP, buff=0.3)
        self.play(Create(target_dot), Write(target_label))
        
        # Frame images above timeline
        first_frame = ImageMobject("module1.2_images/movie_first_frame.png").scale(0.15).move_to(timeline.get_start() + UP * 1.5)
        target_frame = ImageMobject("module1.2_images/movie_target_frame.png").scale(0.15).move_to(target_pos + UP * 1.5)
        last_frame = ImageMobject("module1.2_images/movie_last_frame.png").scale(0.15).move_to(timeline.get_end() + UP * 1.5)
        self.play(FadeIn(first_frame), FadeIn(target_frame), FadeIn(last_frame))
        
        # Yellow dot traveling linearly
        search_dot = Dot(timeline.get_start(), color=YELLOW, radius=0.08)
        self.play(Create(search_dot))
        
        # Move along timeline to target
        self.play(
            search_dot.animate.move_to(target_pos),
            run_time=3,
            rate_func=linear
        )
        
        # Change to green when found
        self.play(search_dot.animate.set_color(GREEN))
        self.wait(1)
        
        # Clear for next strategy
        self.play(
            *[FadeOut(mob) for mob in self.mobjects]
        )
    
    def ginos_strategy(self):
        """Visualize Gino's binary search"""
        # Title
        title = Text("Gino's Strategy: Binary Search", font_size=32).to_edge(UP)
        self.play(Write(title))
        
        # Recreate Gino on left side
        gino = self.create_stick_figure().scale(0.7).to_edge(LEFT).shift(DOWN * 0.5)
        gino_label = Text("Gino", font_size=20).next_to(gino, DOWN, buff=0.2)
        self.play(Create(gino), Write(gino_label))
        
        # Create timeline
        timeline = Line(LEFT * 5 + DOWN * 2, RIGHT * 5 + DOWN * 2, color=WHITE)
        self.play(Create(timeline))
        
        # Dots at beginning and end of timeline
        start_dot = Dot(timeline.get_start(), color=WHITE, radius=0.06)
        end_dot = Dot(timeline.get_end(), color=WHITE, radius=0.06)
        self.play(Create(start_dot), Create(end_dot))
        
        # Timeline labels
        start_label = Text("0:00:00", font_size=16).next_to(timeline.get_start(), DOWN, buff=0.2)
        end_label = Text("2:20:00", font_size=16).next_to(timeline.get_end(), DOWN, buff=0.2)
        self.play(Write(start_label), Write(end_label))
        
        # Target position (40/140)
        target_ratio = 40 / 140
        target_pos = timeline.point_from_proportion(target_ratio)
        
        # Red dot for target
        target_dot = Dot(target_pos, color=RED, radius=0.08)
        target_label = Text("40:00", font_size=14, color=RED).next_to(target_dot, UP, buff=0.3)
        self.play(Create(target_dot), Write(target_label))
        
        # Frame images
        first_frame = ImageMobject("module1.2_images/movie_first_frame.png").scale(0.15).move_to(timeline.get_start() + UP * 1.5)
        target_frame = ImageMobject("module1.2_images/movie_target_frame.png").scale(0.15).move_to(target_pos + UP * 1.5)
        last_frame = ImageMobject("module1.2_images/movie_last_frame.png").scale(0.15).move_to(timeline.get_end() + UP * 1.5)
        self.play(FadeIn(first_frame), FadeIn(target_frame), FadeIn(last_frame))
        
        # Binary search algorithm (working in minutes: 0-140, target=40)
        left = 0
        right = 140
        target = 40
        
        iterations = []
        while left <= right:
            mid = (left + right) // 2
            iterations.append((left, mid, right))
            
            if mid == target:
                break
            elif mid < target:
                left = mid + 1
            else:
                right = mid - 1
        
        # Keep track of previous guesses and eliminated sections
        previous_dots = []
        eliminated_sections = []
        
        # Animate each iteration
        for i, (l, m, r) in enumerate(iterations):
            # Calculate positions on timeline
            mid_ratio = m / 140
            mid_pos = timeline.point_from_proportion(mid_ratio)
            
            # Yellow dot at midpoint
            search_dot = Dot(mid_pos, color=YELLOW, radius=0.08)
            time_text = Text(f"{m}:00", font_size=12, color=YELLOW).next_to(search_dot, DOWN, buff=0.5)
            self.play(Create(search_dot), Write(time_text), run_time=0.5)
            self.wait(0.5)
            
            # Check if found
            if m == target:
                self.play(
                    search_dot.animate.set_color(GREEN),
                    time_text.animate.set_color(GREEN),
                    run_time=0.5
                )
                self.wait(2)
                break
            else:
                # Change current dot to gray and fade out time label
                self.play(
                    search_dot.animate.set_color(GRAY),
                    FadeOut(time_text),
                    run_time=0.3
                )
                
                # Keep this guess visible
                previous_dots.append(search_dot)
                
                # Determine which half to eliminate and color it red
                left_ratio = l / 140
                right_ratio = r / 140
                left_pos = timeline.point_from_proportion(left_ratio)
                right_pos = timeline.point_from_proportion(right_ratio)
                
                if m < target:
                    # Eliminate left half (from left boundary to midpoint)
                    eliminated = Line(
                        left_pos, mid_pos,
                        color=RED,
                        stroke_width=8
                    ).move_to((left_pos + mid_pos) / 2)
                else:
                    # Eliminate right half (from midpoint to right boundary)
                    eliminated = Line(
                        mid_pos, right_pos,
                        color=RED,
                        stroke_width=8
                    ).move_to((mid_pos + right_pos) / 2)
                
                self.play(Create(eliminated), run_time=0.5)
                eliminated_sections.append(eliminated)
                self.wait(0.5)
    
    def create_stick_figure(self):
        """Create a simple stick figure"""
        head = Circle(radius=0.2, color=WHITE)
        body = Line(DOWN * 0.2, DOWN * 0.8, color=WHITE)
        left_arm = Line(DOWN * 0.3, LEFT * 0.3 + DOWN * 0.5, color=WHITE)
        right_arm = Line(DOWN * 0.3, RIGHT * 0.3 + DOWN * 0.5, color=WHITE)
        left_leg = Line(DOWN * 0.8, LEFT * 0.2 + DOWN * 1.2, color=WHITE)
        right_leg = Line(DOWN * 0.8, RIGHT * 0.2 + DOWN * 1.2, color=WHITE)
        
        stick_figure = VGroup(head, body, left_arm, right_arm, left_leg, right_leg)
        return stick_figure
    
    def create_frame_box(self, color=BLUE):
        """Create a small box representing a frame"""
        box = Rectangle(width=0.4, height=0.3, color=color, fill_opacity=0.3)
        return box
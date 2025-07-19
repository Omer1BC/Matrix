from manimlib import *
from collections import *


def dfs(par,rt,all_group):
	if not rt:
		return True
	else:
		if rt.left: 
			rt.scene.play(rt.left.edge.animate.set_fill(BLUE),run_time=.7
			)
			rt.left.pop()
		left = dfs(rt,rt.left,all_group)
		if rt.right:
			rt.scene.play(rt.right.edge.animate.set_fill(RED),run_time=.7
			)
			rt.right.pop()
		right = dfs(rt,rt.right,all_group)
		rt.remove(par,all_group)
		return left or right
def iterative_dfs(rt):
	curr = rt
	stack = [] 
	while curr or stack:
		if curr:
			stack.append(curr)
			curr.pop()
			curr = curr.left
		else:
			curr = stack.pop()
			curr.pop()
			curr.remove()			
			curr = curr.right
def update_tex(scene,text1,val):
	new_count = int(text1.text[0]) + int(val)
	text2 = Text(f'{new_count}').match_style(text1).move_to(text1.get_center())
	# scene.remove(text1)
	# scene.add(text2)
	return text2
def update_text(scene,text1,val):
	text2 = Text(val,font_size=text1.font_size).match_style(text1).move_to(text1.get_center())
	return text2
def get_connects(layers,width,tree):
	connections = VGroup()
	if not tree:
		for i in range(1,len(layers)):
			for n1 in layers[i-1]:
				for n2 in layers[i]:
					connections.add(Line(n1.get_right(),n2.get_left(),stroke_width=width))	
	else:
		for i in range(1,len(layers)):
			for k,rt in enumerate(layers[i-1]):
				left = layers[i][2*k]
				right = layers[i][1 + 2*k]
				connections.add(Line(rt.get_right(),left.get_left(),stroke_width=width))
				connections.add(Line(rt.get_right(),right.get_left(),stroke_width=width))
	return connections
def create_layer(n,x_pos,label=None,normal=True):
	return VGroup(*[Node(label=label if label else (i+1),rs=.2,sc=BLUE,fc=YELLOW).move_to((RIGHT if normal else UP)*x_pos+(UP if normal else RIGHT )*(i-(n-1)/2)) for i in range(n)])
def layers_func(nums,x_pos=-4,label=None,normal=True,dx=4):
	if label:
		return VGroup(*[create_layer(n,RIGHT+ (x_pos + dx*i),label=label) for i,n in enumerate(nums)])
	if nums[len(nums)-1] == 1:
		return VGroup(*[create_layer(n,RIGHT+ (x_pos + dx*i),label=i+1) for i,n in enumerate(nums)])
	return VGroup(*[create_layer(n,RIGHT+ (x_pos + dx*i)) for i,n in enumerate(nums)])
def get_network(arr,label=None,normal=True,width=1.3,tree=False,dx=4):
	layers = layers_func(arr,label=label,normal=normal,dx=2)
	connections = get_connects(layers,width=width,tree=tree)
	return VGroup(*[layers,connections])
class GraphAnim(Scene):
	def construct(self):
		# #init
		nodes = [Node(str(i)) for i in range(5)]
		for i,node in enumerate(nodes):
			node.move_to(LEFT*4 + RIGHT * i * 2)
		arrows = [Arrow(nodes[i].get_right(), nodes[i+1].get_left(),buff=.1) for i in range(len(nodes)-1)]
		self.play(ShowCreation(nodes[0],run_time=.15))
		for node,arrow in zip(nodes[1:],arrows):
			self.play(ShowCreation(arrow,run_time=.5))	
			self.wait(.01)
			self.play(ShowCreation(node,run_time=.15))
		self.play(*[FadeOut(mobj) for mobj in nodes + arrows],run_time=.6)
		#Remove Circle
		self.clear()
		layers = [["A"],["B","C"],["D","E","F","G"],["H","I","J","K","L","M","N","O"]]
		tree = Tree(layers,self)
		tree.show(self)
		# #dfs
		dfs(None,tree.root)
		#array
		values = [1,2,3,4,6,7,8,9,9,10,11,12,13]
		boxes = []
		for i in range(len(values)):
			val = values[i]
			box = Square(side_length=1).shift(RIGHT * i)
			num = Text(str(val),font_size=30).move_to(box.get_center())
			boxes.append(VGroup(box,num))
		array = VGroup(*boxes).move_to(ORIGIN)
		self.play(*[ShowCreation(box[0]) for box in boxes],*[FadeIn(box[1]) for box in boxes])
		arrow = Arrow(UP,DOWN,buff=.1).next_to(boxes[0][0],UP)
		self.play(GrowArrow(arrow))
		for i in range(1,len(boxes)):
			self.play(arrow.animate.next_to(boxes[i][0],UP),run_time=.4)
			self.wait(.1)
		#hm
		hm = {
			"A":1,
			"B":2,
			"C":3
		}
		obj = HM(hm,self,pos=UP,fs=30)
		obj.show()
		#Nodes
		nd = Node("A",scene=self,loc=ORIGIN + LEFT*2,fs=30,rs=.5)
		nd.draw_node()
		c = Node("F(A)",scene=self,loc=ORIGIN + LEFT*2,fs=30,rs=.7)
		c.move_to(nd)
		self.play(Transform(nd,c))
		b = Node("B",scene=self,loc=(ORIGIN + RIGHT * 2),fs=30,rs=.5)
		b.draw_node()
		#Part-1 Nodes
		self.clear()
		into = Text("Nodes",font_size=50)
		self.play(Write(into),run_time=1)
		self.wait()
		self.play(FadeOut(into))
		self.clear()
		node_1 = Node("1",scene=self,loc=ORIGIN + LEFT*2,fs=25,rs=.5)
		node_2 = Node("F(2)",scene=self,loc=ORIGIN + RIGHT *2,fs=25,rs=.5)
		s,e = ORIGIN + LEFT*2 + UP * .25,ORIGIN + RIGHT *2 + UP * .25
		items = VGroup()
		arr1 = Arrow(s,e,buff=.7)
		arr2 = Arrow(e + DOWN * .5,s+DOWN * .5,buff=.7)
		items.add(arr1)
		items.add(arr2)
		node_1.draw_node(run_t=.8)
		self.play(Transform(node_1,Node("F(1)",scene=self,loc=ORIGIN + LEFT*2,fs=25,rs=.5).move_to(node_1)),run_time=.9)
		self.wait()
		self.play(
			ShowCreation(arr1)
		)
		node_2.draw_node(run_t=.5)
		direc = Text('''Directed''',font="Courier",font_size=30).to_edge(LEFT,buff=.8)
		self.play(FadeIn(direc))
		self.play(Indicate(node_1))
		self.wait(.5)
		self.play(Indicate(node_2))
		self.wait()
		self.remove(direc)
		undirec = Text('''Undirected''',font="Courier",font_size=30)
		self.play(FadeIn(undirec.to_edge(LEFT,buff=.8)))
		self.play(ShowCreation(arr2))
		self.play(Indicate(node_2))
		self.wait(.5)
		self.play(Indicate(node_1))		
		self.wait(.5)
		self.play(Transform(items,Line(s+DOWN * .25,e+DOWN*.25,buff=.7)))
		self.remove(undirec)
		#edges
		code = Text(
			'''
			class Node:
				def __init__():
					self.neighbors : List[int] = [...]		
			''',
			font="Courier",font_size=15,fill_color=RED
			).move_to(UP*2+LEFT)
		self.play(Write(code))
		self.wait(.5)
		self.remove(code)
		hm = {
			1:2,
			2:1,	
		}
		obj = HM(hm,self,pos=ORIGIN + UP*2,fs=30)
		obj.show()
		obj.remove()
		self.remove(node_1,node_2,items)
		self.clear()
		#nnet
		self.clear()
		network1 = get_network([1,1,1,1])
		layers,connections = network1
		network1.move_to(ORIGIN)
		self.play(FadeIn(network1))
		#Iterate
		count = Text(f"{layers[len(layers)-1][0].val}",font_size=22).next_to(layers[len(layers)-1][0].circle,UP)
		pointer = Arrow(UP,DOWN,stroke_width=1)
		pointer.scale(.5)
		self.add(pointer)
		for i in range(len(layers)-1):
			node = layers[i][0]
			pointer.next_to(node.circle,UP)
			self.play(Indicate(node),run_time=.5)
		#recurse
		for i in range(len(layers)-2,-1,-1):
			node = layers[i][0]
			edge = connections[i]
			prev = VGroup(node,edge)
			pointer.next_to(node.circle,UP)
			plus_text = Text(f"{node.val} + ").match_style(count).next_to(pointer,UP)
			self.add(plus_text)
			text2 = update_tex(self,count,node.val)
			text2.next_to(pointer,UP)
			self.wait(.8)
			group = VGroup(edge,layers[i+1][0],layers[i+1][0].label,count,plus_text)
			self.play(Transform(group,text2))
			self.remove(group)
			self.add(text2)
			count = text2
		self.remove(pointer)
		self.remove(count)
		#network2
		network2 = get_network([1,2,3,5]).move_to(ORIGIN)
		#recreate network1
		network1 = get_network([1,1,1,1])
		layers,connections = network1
		network1.move_to(ORIGIN)
		self.play(FadeIn(network1))
		self.wait(1)
		self.play(Transform(network1,network2),run_time=3)
		for layer in layers[:-1]:
			self.play(*[Indicate(node) for node in layer])
		#flash
		for con in connections:
			flash = con.copy().set_stroke(YELLOW)
			self.play(ShowPassingFlash(flash))
			# self.play(Indicate(con))
			self.wait(.02)	
		#connectivity
		self.clear()
		comps = [get_network([1,2,1,1],dx=2,label=" "),get_network([1,2,4],label=" ",width=1.3,tree=True).rotate(3*PI/2)]
		components = VGroup(*[comp.scale(.7) for comp in comps])
		components.arrange(RIGHT,buff=2)
		saved = components[1].get_center()
		self.play(FadeIn(components))
		self.play(components[0].animate.scale(1.2))
		layer,con = components[0]
		self.play(*[Indicate(item,scale_factor=1.02) for item in con],run_time=1)
		self.play(*[Indicate(node) for lay in layer for node in lay],run_time=1)
		def cycle(scn,layers,con):
			scn.play(
				Indicate(layers[0][0]),
				Indicate(con[0],scale_factor=1.02)
				)
			scn.play(
				Indicate(layers[1][0]),
				Indicate(con[2],scale_factor=1.02)
				)
			scn.play(
				Indicate(layers[2][0]),
				Indicate(con[3],scale_factor=1.02)
				)
			scn.play(
				Indicate(layers[1][1]),
				Indicate(con[1],scale_factor=1.02)
				)
			scn.play(
				Indicate(layers[0][0])
				)
		cycle(self,layer,con)
		self.play(components[0].animate.scale(1/1.2))
		#comp3
		self.play(FadeOut(components[0]))
		self.play(components[1].animate.move_to(ORIGIN).scale(1.2))
		layer,con = components[1]
		lin = Line(layer[1][0].get_right(),layer[1][1].get_left()).match_style(con[0])
		self.wait(1)
		self.play(ShowCreation(lin))
		self.play(
			Indicate(layer[0][0]),
			Indicate(con[0],scale_factor=1),
			Indicate(layer[1][0]),
			Indicate(con[1],scale_factor=1),
			Indicate(layer[1][1]),
			Indicate(lin,scale_factor=1),
			)
		self.play(FadeOut(lin))
		self.wait(.5)
		original_lines = [Line(cn.get_start(), cn.get_end()).match_style(cn) for cn in con]
		self.play(*[Transform(cn,Arrow(cn.get_start(),cn.get_end())) for cn in con])
		self.wait(.5)
		[self.play(*[Indicate(node) for node in lay]) for lay in layer] 
		self.wait(.5)
		self.play(*[Transform(cn, orig) for cn, orig in zip(con, original_lines)])
		#LLIST
		self.play(components[1].animate.rotate(PI/2))
		llist = get_network([1,1,1,1,1,1,1],dx=2,label=" ").scale(.7).move_to(ORIGIN)
		self.play(Transform(components[1],llist),run_time=1)
		arc = ArcBetweenPoints(llist[0][3][0].get_bottom(), llist[0][5][0].get_bottom(), angle=PI/2).match_style(llist[1][0])  
		self.wait(2)
		self.play(ShowCreation(arc))
		self.wait(2)
		self.play(FadeOut(arc))
		tex = Text("Edges of a tree: N-1",font_size=15).to_edge(DOWN,buff=.5)
		self.play(Write(tex))
		layers,con = llist
		for i in range(1,len(layers)):
			self.play(Indicate(layers[i][0]),Indicate(con[i-1],scale_factor=1))
		self.clear()
		comps = [get_network([1,2,1,1],dx=2,label=" "),get_network([1,2,4],label=" ",width=1.3,tree=True).rotate(3*PI/2)]
		components = VGroup(*[comp.scale(.7) for comp in comps])
		components.arrange(RIGHT,buff=2)
		saved = components[1].get_center()
		self.play(FadeIn(components))
		#Traversal
		self.clear()
		gt = Text("Graph Traversal")
		self.play(Write(gt))
		self.play(FadeOut(gt))
		fib = VGroup()
		indic = VGroup()
		for i,v in enumerate([1,1,2,3,5]):
			tex = Square(side_length=1).move_to(RIGHT*i)
			sq = Text(str(v),font_size=30).move_to(tex.get_center())
			fib.add(VGroup(sq,tex))
			indic.add(Text(str(i),font_size=23).next_to(tex,DOWN))
		self.play(ShowCreation(fib.move_to(ORIGIN)))
		self.play(ShowCreation(indic.next_to(fib,DOWN)))
		arc = VGroup(ArcBetweenPoints(fib[4][1].get_top(), fib[3][1].get_top(), angle=PI/2),ArcBetweenPoints(fib[4][1].get_top(), fib[2][1].get_top(), angle=PI/2))
		self.play(ShowCreation(arc[0]))
		self.play(Indicate(fib[3],scale_factor=1.1))
		self.play(ShowCreation(arc[1]))
		self.play(Indicate(fib[2],scale_factor=1.1))
		self.play(Indicate(fib[0],scale_factor=1.1),Indicate(fib[1],scale_factor=1.1))
		all_group = VGroup(fib,indic)
		#Graph
		self.clear()
		root = (Node(label="F(N)",rs=.4))
		arrangment = VGroup(all_group,root)
		self.play(arrangment.animate.arrange(UP,buff=2),run_time=1)
		left = Node(label="F(N-1)",rs=.4).move_to(root.get_center() + RIGHT*2 + UP)
		right = Node(label="F(N-2)",rs=.4).move_to(root.get_center() + RIGHT*2 + DOWN)
		edges = VGroup()
		for node in (left,right):
			edges.add(Arrow(root.get_center(),node.get_center(),buff=.4,stroke_width=.2))
		self.play(ShowCreation(edges[0]))
		self.play(ShowCreation(left))
		self.play(ShowCreation(edges[1]))
		self.play(ShowCreation(right))
		self.play(FadeIn(Text("+",font_size=20).move_to(root.get_center() + RIGHT * 2)),run_time=.8)
		#Fib Tree
		self.clear()
		hm = (HM({4:[2,3],3:[1,2],2:[0,1]},self,fs=18,pos=LEFT*4.5))
		hm.show()
		layers = [["F(4)"],["F(2)","F(3)"],["F(0)","F(1)","F(1)","F(2)"],[None,None,None,None,None,None,"F(0)","F(1)",]]
		tree = Tree(layers,self)
		tree.show(self)
		sentinel = Node(scene=self,label="A",loc=UP*2.5)
		code = Text(
			'''
			def dfs(curr):
				if curr == 0 or curr == 1:
					return 1
				left_nbr,right_nbr = nbrs[curr]
				l = dfs(left_nbr)
				r = dfs(right_nbr)
				return l+r
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)
		self.play(Write(code.shift(UP*2.4)))
		self.play(FadeIn(all_group.next_to(tree,LEFT*6.1+DOWN*9.5).scale(.8)),FadeIn(Text("fib =",font_size=18).next_to(all_group[0],LEFT)))
		dfs(sentinel,tree.root,all_group)
		self.wait()
		code = Text(
			'''
			def dfs(curr):
				if curr == 0 or curr == 1:
					return 1
				l = dfs(curr-1)
				r = dfs(curr-2)
				return l + r
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)		
		#generalizing dfs
		self.clear()
		lines = ["","Cycles","Multiple neighbors","Components"]		
		bullets = VGroup()
		for i,line in enumerate(lines):
			text = Text( f"{("- " if i > 0 else "") + line}",font_size=40)
			bullets.add(text)
		bullets.arrange(DOWN,aligned_edge=LEFT,buff=.5)
		bullets.to_edge(LEFT)
		self.play(Write(bullets))
		self.wait(2)
		self.play(bullets[2].animate.set_opacity(.2),bullets[2].animate.set_opacity(.2),bullets[3].animate.set_opacity(.2),bullets[2].animate.set_opacity(.2))
		self.wait(1)
		#Nodes
		self.clear()
		node_1 = Node("1",scene=self,fs=25,rs=.5).move_to(ORIGIN + LEFT*1.5)
		node_2 = Node("2",scene=self,fs=25,rs=.5).move_to(ORIGIN + RIGHT *1.5)
		node_3 = Node("3",scene=self,fs=25,rs=.5).move_to(ORIGIN + RIGHT*1.5 + DOWN*3 )
		dx = .2
		buff = .8
		s,e=node_2.circle.get_center() + RIGHT * dx,node_3.circle.get_center() + RIGHT * dx
		b1,b2 = Arrow(s,e,buff=buff),Arrow(e + LEFT*2*dx,s + LEFT * 2*dx, buff=buff)
		s,e = node_1.circle.get_center(),node_2.circle.get_center()
		a1 = Arrow(s + UP * dx ,e + UP * dx,buff=buff)
		a2 = Arrow(e + DOWN * dx,s+DOWN * dx,buff=buff)
		nodes = VGroup(node_1,node_2,node_3)
		arrows = VGroup(a1,a2,b1,b2)
		every = VGroup(nodes,arrows).move_to(ORIGIN)
		every.scale(.8)
		self.play(FadeIn(every))
		self.play(Indicate(a1,scale_factor=1.1),run_time=1.5)
		self.play(Indicate(a2,scale_factor=1.1),run_time=1.5)
		visit = Text("Visit = {").to_edge(LEFT + UP,buff=.5)
		close = Text("}").next_to(visit,RIGHT)
		self.play(FadeIn(visit))
		def append(prev,string,curr):
			newTex = Text(string).next_to(prev,RIGHT)
			self.play(close.animate.next_to(newTex,RIGHT))
			self.play(FadeIn(newTex),curr.circle.animate.set_stroke(RED))
			return newTex
		for c in [nodes[0]]:
			visit = append(visit,c.val,c)
		self.wait(1)
		self.play(Indicate(nodes[1]))
		visit = append(visit,nodes[1].val,nodes[1])
		self.wait(1)
		self.play(Indicate(a2),run_time=.8)
		self.play(FadeOut(a2))
		self.wait(1)
		self.play(Indicate(nodes[2]))
		visit = append(visit,nodes[2].val,nodes[2])
		self.play(FadeOut(b2))
		self.wait()
		a =Arrow(nodes[2].circle.get_left(),nodes[0].circle.get_right(),buff=.4)
		self.wait()
		self.play(FadeIn(a))
		self.wait()
		self.play(FadeOut(a))
		code = Text(
			'''
			def dfs(curr):
				if curr in visit:
					return 
				visit.add(curr)
				left_nbr,right_nbr = nbrs[curr]
				dfs(left_nbr)
				dfs(right_nbr)
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)
		self.play(Write(code))
		#Multiple neighbors
		self.clear()
		self.play(FadeIn(bullets))
		self.play(bullets[1].animate.set_opacity(.2),bullets[2].animate.set_opacity(1),bullets[3].animate.set_opacity(.2),run_time=.8)
		self.play(FadeOut(bullets))
		network = get_network([1,5],label=" ").move_to(ORIGIN)
		self.play(FadeIn(network))
		for node in network[0][1][::-1]:
			self.play(Indicate(node))
			self.wait(.001)
		code = Text(
			'''
				for nbr in nbrs[curr]:
					.
					.
					.
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)		
		self.play(Write(code))
		self.wait(2)
		self.clear()
		#Last
		self.play(FadeIn(bullets))
		self.play(bullets[1].animate.set_opacity(.2),bullets[3].animate.set_opacity(1),bullets[2].animate.set_opacity(.2),run_time=.8)
		self.wait()
		#Last1
		self.clear()
		comps = [get_network([1,2,1,1],dx=2,label=" "),get_network([1,2,4],label=" ",width=1.3,tree=True).rotate(3*PI/2)]
		components = VGroup(*[comp.scale(.7) for comp in comps]).arrange(RIGHT,buff=2)
		self.play(FadeIn(components))
		first_comp = components[0][0]
		nodes = [first_comp[0][0],first_comp[1][0],first_comp[2][0],first_comp[1][1],first_comp[3][0]]
		for node in nodes:
			self.play(node.circle.animate.set_stroke(RED),run_time=.6)
		self.wait()
		self.play(FadeOut(components[0]))
		self.wait()
		self.play(Indicate(components[1][0][0][0]))
		code = Text(
			'''
				for node in Graph:
					if node not in visit:
						dfs(node)	
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)		
		self.play(Write(code))
		self.wait()
		self.clear()
		#Putting it all together
		code = Text(
			'''
				visit = set()
				def visit(curr):
					if curr not in visit:
						return
					visit.add(curr)
					for nbr in nbrs[curr]:
						dfs(nbr)
				for node in Graph:
					if node not in visit:
						dfs(node)	
			''',
			font="Courier",font_size=17
			).to_edge(LEFT*1.5 ,buff=.29)	
		self.play(Write(code))
		# items = VGroup()
		# for i, (key,value) in enumerate(hm.items()):
		# 	key_text = Text(f"{key}:").set_color(BLUE)
		# 	val_text = Text(f"{value}").set_color(YELLOW)
		# 	pair = VGroup(key_text,val_text).arrange(RIGHT,buff=.5)
		# 	pair.move_to(UP*i*-1.2)
		# 	items.add(pair)
		# items.move_to(ORIGIN)
		# left_brace = Text("{").next_to(items,LEFT,buff=.4)
		# right_brace = Text("}").next_to(items,RIGHT,buff=.4)
		# left_brace.align_to(items,UP)
		# right_brace.align_to(items,DOWN)
		# self.play(FadeIn(items),FadeIn(left_brace),FadeIn(right_brace))
		# self.play(Transform(items[1][1],Text("8").move_to(items[1][1])))
class HashMapVGroup(VGroup):
    def __init__(self, initial_data: dict, buff=0.2, **kwargs):
        super().__init__(**kwargs)
        self.buff = buff
        self._map = dict(initial_data)
        self.entries = {}  # key -> Text Mobject
        self.body_group = VGroup()
        self.left_brace = Text("{").scale(0.6)
        self.right_brace = Text("}").scale(0.6)
        self._init_from_dict(self._map)

    def _make_entry(self, key, value):
        text = Text(f"{key}: {value}").scale(0.5)
        return text

    def _init_from_dict(self, data):
        for k, v in data.items():
            entry = self._make_entry(k, v)
            self.entries[k] = entry
            self.body_group.add(entry)
        self.body_group.arrange(DOWN, aligned_edge=LEFT, buff=self.buff)
        self._update_braces()

    def _update_braces(self):
        if len(self.body_group.submobjects) == 0:
            self.left_brace.next_to(ORIGIN, LEFT)
            self.right_brace.next_to(self.left_brace, RIGHT)
            self.clear()
            self.add(self.left_brace, self.right_brace)
            return

        self.left_brace.next_to(self.body_group, LEFT)
        self.right_brace.next_to(self.body_group, RIGHT)
        self.clear()
        self.add(self.left_brace, self.body_group, self.right_brace)

    def update_entry(self, key, new_value):
        if key not in self.entries:
            return AnimationGroup()

        old_entry = self.entries[key]
        new_entry = self._make_entry(key, new_value).move_to(old_entry)
        self.entries[key] = new_entry
        self._map[key] = new_value

        def update_group():
            self.body_group.submobjects = [
                self.entries[k] for k in sorted(self.entries.keys())
            ]
            self.body_group.arrange(DOWN, aligned_edge=LEFT, buff=self.buff)
            self._update_braces()

        return Succession(
            FadeOut(old_entry),
            FadeIn(new_entry),
            UpdateFromFunc(self, lambda _: update_group())
        )

    def add_entry(self, key, value):
        if key in self.entries:
            return self.update_entry(key, value)

        entry = self._make_entry(key, value)
        entry.set_opacity(0)
        self.entries[key] = entry
        self.body_group.add(entry)
        self._map[key] = value

        self.body_group.arrange(DOWN, aligned_edge=LEFT, buff=self.buff)
        self._update_braces()

        return FadeIn(entry)

    def remove_entry(self, key):
        if key not in self.entries:
            return AnimationGroup()

        entry = self.entries[key]
        self.body_group.remove(entry)
        del self.entries[key]
        del self._map[key]

        self.body_group.arrange(DOWN, aligned_edge=LEFT, buff=self.buff)
        self._update_braces()

        return FadeOut(entry)

    def get_map(self):
        return dict(self._map)
class HM(VGroup):

	def __init__(self,hm,scene,pos=ORIGIN,fs=12):
		super().__init__()
		self.items = VGroup()
		for i, (key,value) in enumerate(hm.items()):
			key_text = Text(f"{key}:",font_size=fs).set_color(BLUE)
			val_text = Text(f"{value}",font_size=fs).set_color(YELLOW)
			pair = VGroup(key_text,val_text).arrange(RIGHT,buff=.5)
			pair.move_to(UP*i*-.5)
			self.items.add(pair)
		self.items.move_to(pos)
		self.left_brace = Text("nbrs = {",font_size=fs).next_to(self.items,LEFT,buff=.2)
		self.right_brace = Text("}",font_size=fs).next_to(self.items[len(self.items)-1],RIGHT,buff=.2)
		self.left_brace.align_to(self.items,UP)
		self.right_brace.align_to(self.items,DOWN)
		self.scene = scene
	def show(self):
		self.scene.play(FadeIn(self.items),FadeIn(self.left_brace),FadeIn(self.right_brace))
	def remove(self):
		self.scene.play(FadeOut(self.items),FadeOut(self.left_brace),FadeOut(self.right_brace))
class Node(VGroup):
	def __init__(self,label,left=None,right=None,scene=None,fc=YELLOW,loc=UP*1.5,fs=15,rs=.32,sc=BLUE):
		super().__init__()
		self.val = label
		self.circle = Circle(radius=rs,stroke_color=sc)
		self.label = Text(str(label),font_size=fs,fill_color=fc).move_to(self.circle.get_center())
		self.add(self.circle,self.label)
		self.left = left 
		self.right = right
		self.scene = scene
		self.edge = None
		self.loc = loc
		self.res = [None,None]
	def update_label(self,val):
		self.scene.remove(self.label)
		self.label = update_text(self.scene,self.label,val).move_to(self.circle.get_center())
		self.scene.add(self.label)
		self.val = val
	def pop(self):
		self.scene.play(Indicate(self))
		# temp = self.copy()
		# self.scene.add(temp)
		# self.scene.play(
		# 	temp.animate.scale(1.2),
		# 	temp.circle.animate.set_stroke(GREEN,width=6),
		# 	run_time=.15
		# 	)
		# self.scene.wait(.1)
		# self.scene.play(
		# 	FadeOut(temp)
		# 	)
	def pop_green(self):
		temp = self.copy()
		self.scene.add(temp)
		self.scene.play(
			temp.animate.scale(1.2),
			temp.circle.animate.set_stroke(GREEN,width=6),
			run_time=.15
			)
		self.scene.wait(.1)
		self.scene.play(
			FadeOut(temp)
			)
	def remove(self,par,all_group):
		removals = [FadeOut(self)]
		removals += [FadeOut(self.edge)] if self.edge != None else []
		group = VGroup()
		if self.edge != None: group.add(self.edge)
		group.add(self)
		if par != None:
			result = str(int(self.res[0].text) + int(self.res[1].text)) if self.val not in ("F(0)","F(1)") else "1"
			if self.res[0] is not None:
				self.scene.wait(.5)
				group.add(self.res[0])

				# self.scene.play(
				# 	FadeOut(self.res[0])
				# )
				# self.scene.play(FadeOut(self.res[0]))
			if self.res[1] is not None:
				self.scene.wait(.5)
				group.add(self.res[1])
				# self.scene.play(
				# 	FadeOut(self.res[1])
				# )
				# self.scene.play(FadeOut(self.res[1]))
				
			tex = Text(result,font_size=20,fill_color=BLUE if par.left == self else RED)
			tex.next_to(par,LEFT if par.left == self else RIGHT)
			if par.left == self:
				par.res[0] = tex 
			else:
				par.res[1] = tex
			# self.scene.play(
			# 	FadeOut(group)
			# 	)
			# self.scene.play(
			# 	FadeIn(tex)
			# 	)

			i = int(self.val[2])
			self.scene.play(Transform(group,tex),Indicate(all_group[0][i]),run_time=1.2)
			self.scene.add(tex)
			self.scene.remove(group)

	def draw_node(self,scale=1,run_t=.1):
		scene = self.scene
		rt = self
		left = self.left 
		right = self.right
		if left:
			print("LEFT IS ",left)
			left.move_to(rt.get_center() + LEFT * 2 * scale + DOWN * 1.5)
			le = Arrow(rt.get_bottom(),left.get_top(),buff=.1)
			left.edge = le
			scene.play(ShowCreation(le),run_time=.2)
			scene.play(FadeIn(left,run_time=run_t))
			# left.pop()
		if right:
			right.move_to(rt.get_center() + RIGHT * 2 * scale + DOWN * 1.5)
			re = Arrow(rt.get_bottom(),right.get_top(),buff=.1)
			right.edge = re
			scene.play(ShowCreation(re),run_time=.2)
			scene.play(FadeIn(right,run_time=run_t))
			# right.pop()
		if not right and not left:
			rt.move_to(self.loc)
			scene.play(FadeIn(rt,run_time=run_t))


class Tree(VGroup):
	def __init__(self,layers,scene=None):
		super().__init__()
		self.layers = layers
		self.root = Node(layers[0][0],scene=scene,fc=WHITE,sc=WHITE)
		self.arrows = []
		self.nodes = []
	def show(self,scene):
		layers = self.layers
		'''
		[[1],[2,3],[4,None,None,6]]
		'''
		prev = [self.root]
		prev[0].draw_node()
		# self.draw_node(prev[0],prev[0].scene)
		for i in range(1,len(layers)):
			curr = []
			layer = layers[i]
			for j in range(1,len(layer),2):
				left = Node(layer[j-1],scene=self.root.scene,fc=WHITE,sc=WHITE) if layer[j-1] != None else None
				right = Node(layer[j],scene=self.root.scene,fc=WHITE,sc=WHITE) if layer[j] != None else None
				print(left,right,layer,j)
				if left or right:
					parent = prev[j//2]
					if left:
						parent.left = left
					if right:
						parent.right = right 
					# self.draw_node(parent,scene,scale=1/i)
					parent.draw_node(scale=1/i)
				curr += [left, right]
			prev = curr
	def draw_node(self,rt,scene,scale=1):
		left = rt.left 
		right = rt.right
		print("L,R",left,right)
		if left:
			left.move_to(rt.get_center() + LEFT * 2 * scale + DOWN * 1.5)
			le = Arrow(rt.get_bottom(),left.get_top(),buff=.1)
			left.edge = le
			scene.play(ShowCreation(le),run_time=.2)
			scene.play(FadeIn(left,run_time=.1))
			# left.pop()
		if right:
			right.move_to(rt.get_center() + RIGHT * 2 * scale + DOWN * 1.5)
			re = Arrow(rt.get_bottom(),right.get_top(),buff=.1)
			right.edge = re
			scene.play(ShowCreation(re),run_time=.2)
			scene.play(FadeIn(right,run_time=.1))
			# right.pop()
		if not right and not left:
			rt.move_to(UP*1.5)
			scene.play(FadeIn(rt,run_time=.1))











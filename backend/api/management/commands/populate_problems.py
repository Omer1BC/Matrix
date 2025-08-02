# management/commands/populate_problems.py
# Create this file in: your_app/management/commands/populate_problems.py

from django.core.management.base import BaseCommand
from api.models import ProblemCategory, Problem  # Replace 'your_app' with your actual app name

class Command(BaseCommand):
    help = 'Populate the database with initial problem categories and problems'

    def handle(self, *args, **options):
        # Clear existing data (optional)
        Problem.objects.all().delete()
        ProblemCategory.objects.all().delete()
        
        problem_categories_data = {
            'introduction': {
                'title': "Introduction",
                'icon': "🚀",
                'items': [
                    {'id': "intro-1", 'title': "Hello World", 'description': "Your first Python program", 'difficulty': "Easy"},
                    {'id': "intro-2", 'title': "Basic Variables", 'description': "Working with variables and types", 'difficulty': "Easy"},
                    {'id': "intro-3", 'title': "Simple Math", 'description': "Basic arithmetic operations", 'difficulty': "Easy"},
                    {'id': "intro-4", 'title': "String Manipulation", 'description': "Working with strings", 'difficulty': "Easy"}
                ]
            },
            'nodesandedges': {
                'title': "Nodes & Edges",
                'icon': "📊",
                'items': [
                    {'id': "ds-1", 'title': "Node", 'description': "Basic Unit of a Graph", 'difficulty': "Easy"},
                    {'id': "ds-2", 'title': "Edge", 'description': "Basic Unit of a Graph", 'difficulty': "Easy"},
                    {'id': "ds-3", 'title': "Cycles", 'description': "Basic Property of a Graph", 'difficulty': "Medium"},
                ]
            },
            'pathsandcycles': {
                'title': "Paths And Cycles",
                'icon': "🔄",
                'items': [
                    {'id': "sort-1", 'title': "Bubble Sort", 'description': "Simple sorting algorithm", 'difficulty': "Easy"},
                    {'id': "sort-2", 'title': "Selection Sort", 'description': "Find minimum and swap", 'difficulty': "Easy"},
                    {'id': "sort-3", 'title': "Insertion Sort", 'description': "Insert elements in order", 'difficulty': "Medium"},
                    {'id': "sort-4", 'title': "Merge Sort", 'description': "Divide and conquer sorting", 'difficulty': "Hard"},
                    {'id': "sort-5", 'title': "Quick Sort", 'description': "Efficient pivot-based sort", 'difficulty': "Hard"}
                ]
            },
            'connectedcomponents': {
                'title': "Connected Components",
                'icon': "🔢",
                'items': [
                    {'id': "count-1", 'title': "Count Elements", 'description': "Count occurrences in array", 'difficulty': "Easy"},
                    {'id': "count-2", 'title': "Frequency Counter", 'description': "Character frequency counting", 'difficulty': "Medium"},
                    {'id': "count-3", 'title': "Unique Elements", 'description': "Find unique items", 'difficulty': "Medium"},
                    {'id': "count-4", 'title': "Permutations", 'description': "Count possible arrangements", 'difficulty': "Hard"},
                    {'id': "count-5", 'title': "Combinations", 'description': "Count possible selections", 'difficulty': "Hard"}
                ]
            },
            'decision': {
                'title': "Decision Problems",
                'icon': "🤔",
                'items': [
                    {'id': "dec-1", 'title': "Even or Odd", 'description': "Determine number parity", 'difficulty': "Easy"},
                    {'id': "dec-2", 'title': "Prime Check", 'description': "Check if number is prime", 'difficulty': "Medium"},
                    {'id': "dec-3", 'title': "Palindrome", 'description': "Check string palindrome", 'difficulty': "Medium"},
                    {'id': "dec-4", 'title': "Valid Parentheses", 'description': "Check bracket matching", 'difficulty': "Hard"},
                    {'id': "dec-5", 'title': "Binary Search", 'description': "Search in sorted array", 'difficulty': "Hard"}
                ]
            }
        }

        # Create categories and problems
        for order, (key, category_data) in enumerate(problem_categories_data.items()):
            # Create category
            category = ProblemCategory.objects.create(
                key=key,
                title=category_data['title'],
                icon=category_data['icon'],
                order=order
            )
            
            self.stdout.write(f"Created category: {category.title}")
            
            # Create problems for this category
            for problem_order, item in enumerate(category_data['items']):
                problem = Problem.objects.create(
                    category=category,
                    problem_id=item['id'],
                    title=item['title'],
                    description=item['description'],
                    difficulty=item['difficulty'],
                    order=problem_order,
                    method_stub="def solution():\n    # Your code here\n    pass",
                    input_args=[],
                    tools={}
                )
                self.stdout.write(f"  Created problem: {problem.title}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {ProblemCategory.objects.count()} categories '
                f'and {Problem.objects.count()} problems'
            )
        )
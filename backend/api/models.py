# models.py
from django.db import models
import json

class ProblemCategory(models.Model):
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Problem Category'
        verbose_name_plural = 'Problem Categories'

    def __str__(self):
        return self.title

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    category = models.ForeignKey(ProblemCategory, on_delete=models.CASCADE, related_name='problems')
    problem_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Easy')
    order = models.IntegerField(default=0)
    
    # Code related fields
    method_stub = models.TextField(help_text="Starter code template for the problem")
    solution = models.TextField(blank=True, help_text="Reference solution for the problem")
    
    # Test cases stored as JSON
    test_cases = models.TextField(default='[]', help_text="JSON array of test cases")
    
    # Legacy fields (can be removed if not needed)
    input_args = models.JSONField(default=list)
    tools = models.JSONField(default=dict)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__order', 'order']
        verbose_name = 'Problem'
        verbose_name_plural = 'Problems'

    def __str__(self):
        return f"{self.problem_id}: {self.title}"

    def get_test_cases(self):
        """Parse test cases from JSON string"""
        try:
            return json.loads(self.test_cases) if self.test_cases else []
        except json.JSONDecodeError:
            return []

    def set_test_cases(self, test_cases_list):
        """Set test cases as JSON string"""
        self.test_cases = json.dumps(test_cases_list)

    def add_test_case(self, input_data, expected_output, description=""):
        """Add a new test case"""
        test_cases = self.get_test_cases()
        test_cases.append({
            'input': input_data,
            'expected_output': expected_output,
            'description': description
        })
        self.set_test_cases(test_cases)
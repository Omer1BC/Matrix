# Add this to your api/models.py file
from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.db.models import QuerySet

class ProblemCategory(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    key = models.CharField(max_length=50, unique=True)  # e.g., 'introduction', 'datastructures'
    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0)  # For ordering categories
    
    if TYPE_CHECKING:
        problems: "QuerySet[Problem]"
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name_plural = "Problem Categories"
    
    def __str__(self):
        return self.title

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    category = models.ForeignKey(ProblemCategory, on_delete=models.CASCADE, related_name='problems')
    problem_id = models.CharField(max_length=50, unique=True)  # e.g., 'intro-1', 'ds-1'
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    method_stub = models.TextField(blank=True, null=True)
    input_args = models.JSONField(default=list, blank=True)  # Store as JSON array
    tools = models.JSONField(default=dict, blank=True)  # Store tools as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0)  # For ordering problems within category
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['category', 'order', 'title']
        unique_together = ['category', 'order']
    
    def __str__(self):
        return f"{self.problem_id}: {self.title}"
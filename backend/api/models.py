# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import json


class User(AbstractUser):
    """Extended user model with additional fields for progression tracking"""

    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True, max_length=500)
    total_problems_solved = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity = models.DateTimeField(null=True, blank=True)

    # Profile settings
    preferred_language = models.CharField(max_length=20, default="python")
    is_premium = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

    @property
    def completion_percentage(self):
        """Calculate overall completion percentage"""
        total_problems = Problem.objects.count()
        if total_problems == 0:
            return 0
        return (self.total_problems_solved / total_problems) * 100


class ProblemCategory(models.Model):
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    order = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    is_locked_by_default = models.BooleanField(
        default=False,
        help_text="If True, category is locked until prerequisites are met",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Problem Category"
        verbose_name_plural = "Problem Categories"

    def __str__(self):
        return self.title

    def is_unlocked_for_user(self, user):
        """Check if this category is unlocked for the given user"""
        if not self.is_locked_by_default:
            return True

        # Get the previous category
        previous_category = (
            ProblemCategory.objects.filter(order__lt=self.order)
            .order_by("-order")
            .first()
        )

        if not previous_category:
            return True

        # Check if all problems in the previous category are completed
        return previous_category.is_completed_by_user(user)

    def is_completed_by_user(self, user):
        """Check if all problems in this category are completed by the user"""
        total_problems = self.problems.count()
        if total_problems == 0:
            return True

        completed_problems = ProblemCompletion.objects.filter(
            user=user, problem__category=self, is_completed=True
        ).count()

        print(completed_problems, total_problems)

        return completed_problems == total_problems

    def get_completion_stats_for_user(self, user):
        """Get completion statistics for this category for a specific user"""
        total_problems = self.problems.count()
        completed_problems = ProblemCompletion.objects.filter(
            user=user, problem__category=self, is_completed=True
        ).count()

        return {
            "total": total_problems,
            "completed": completed_problems,
            "percentage": (
                (completed_problems / total_problems * 100) if total_problems > 0 else 0
            ),
        }


class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ("Easy", "Easy"),
        ("Medium", "Medium"),
        ("Hard", "Hard"),
    ]

    category = models.ForeignKey(
        ProblemCategory, on_delete=models.CASCADE, related_name="problems"
    )
    problem_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="Easy"
    )
    order = models.IntegerField(default=0)

    # Progression settings
    is_locked_by_default = models.BooleanField(
        default=True,
        help_text="If True, problem is locked until previous one is completed",
    )
    points_reward = models.IntegerField(
        default=10, help_text="Points awarded for completing this problem"
    )

    # Code related fields
    method_stub = models.TextField(help_text="Starter code template for the problem")
    solution = models.TextField(
        blank=True, help_text="Reference solution for the problem"
    )

    # Test cases stored as JSON
    test_cases = models.TextField(default="[]", help_text="JSON array of test cases")

    # Legacy fields (can be removed if not needed)
    input_args = models.JSONField(default=list)
    tools = models.JSONField(default=dict)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category__order", "order"]
        verbose_name = "Problem"
        verbose_name_plural = "Problems"
        unique_together = ["category", "order"]

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
        test_cases.append(
            {
                "input": input_data,
                "expected_output": expected_output,
                "description": description,
            }
        )
        self.set_test_cases(test_cases)

    def is_unlocked_for_user(self, user):
        """Check if this problem is unlocked for the given user"""
        # Check if category is unlocked first

        if not self.category.is_unlocked_for_user(user):
            return False

        if not self.is_locked_by_default:
            return True

        # Get the previous problem in the same category
        previous_problem = (
            Problem.objects.filter(category=self.category, order__lt=self.order)
            .order_by("-order")
            .first()
        )

        if not previous_problem:
            return True

        # Check if previous problem is completed
        return ProblemCompletion.objects.filter(
            user=user, problem=previous_problem, is_completed=True
        ).exists()

    def get_completion_for_user(self, user):
        """Get completion record for this problem and user"""
        try:
            return ProblemCompletion.objects.get(user=user, problem=self)
        except ProblemCompletion.DoesNotExist:
            return None


class ProblemCompletion(models.Model):
    """Track user completion of problems"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completions")
    problem = models.ForeignKey(
        Problem, on_delete=models.CASCADE, related_name="completions"
    )

    # Completion status
    is_completed = models.BooleanField(default=False)
    is_attempted = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    first_attempt_date = models.DateTimeField(auto_now_add=True)

    # Solution tracking
    user_solution = models.TextField(blank=True, help_text="User's submitted solution")
    attempts_count = models.IntegerField(default=0)
    hints_used = models.IntegerField(default=0)

    # Performance metrics
    time_spent_seconds = models.IntegerField(
        default=0, help_text="Total time spent on this problem"
    )
    test_cases_passed = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)

    # Scoring
    points_earned = models.IntegerField(default=0)
    efficiency_score = models.FloatField(
        default=0.0, help_text="Score based on solution efficiency"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "problem"]
        ordering = ["-updated_at"]
        verbose_name = "Problem Completion"
        verbose_name_plural = "Problem Completions"

    def __str__(self):
        status = (
            "Completed"
            if self.is_completed
            else "Attempted" if self.is_attempted else "Not Started"
        )
        return f"{self.user.username} - {self.problem.title} ({status})"

    def mark_as_completed(self, user_solution="", points_override=None):
        """Mark this problem as completed"""
        from django.utils import timezone

        self.is_completed = True
        self.is_attempted = True
        self.completion_date = timezone.now()
        self.user_solution = user_solution

        # Award points
        if points_override is not None:
            self.points_earned = points_override
        else:
            self.points_earned = self.problem.points_reward

        self.save()

        # Update user stats
        self.user.total_problems_solved = ProblemCompletion.objects.filter(
            user=self.user, is_completed=True
        ).count()
        self.user.last_activity = timezone.now()
        self.user.save()

    def record_attempt(self, user_solution=""):
        """Record an attempt on this problem"""
        self.is_attempted = True
        self.attempts_count += 1
        self.user_solution = user_solution
        self.save()


class CategoryPrerequisite(models.Model):
    """Define prerequisites between categories"""

    category = models.ForeignKey(
        ProblemCategory, on_delete=models.CASCADE, related_name="prerequisites"
    )
    required_category = models.ForeignKey(
        ProblemCategory, on_delete=models.CASCADE, related_name="unlocks"
    )
    min_completion_percentage = models.IntegerField(
        default=100, help_text="Minimum % of problems to complete in required category"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["category", "required_category"]
        verbose_name = "Category Prerequisite"
        verbose_name_plural = "Category Prerequisites"

    def __str__(self):
        return f"{self.category.title} requires {self.min_completion_percentage}% of {self.required_category.title}"

    def clean(self):
        if self.category == self.required_category:
            raise ValidationError("A category cannot be a prerequisite for itself")


class UserProgress(models.Model):
    """Summary of user progress across all categories"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="progress")

    # Overall statistics
    total_points = models.IntegerField(default=0)
    current_level = models.IntegerField(default=1)
    experience_points = models.IntegerField(default=0)

    # Current working area
    current_category = models.ForeignKey(
        ProblemCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    current_problem = models.ForeignKey(
        Problem, on_delete=models.SET_NULL, null=True, blank=True
    )

    # Achievements
    achievements_earned = models.JSONField(
        default=list, help_text="List of achievement IDs earned"
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Progress"
        verbose_name_plural = "User Progress"

    def __str__(self):
        return f"{self.user.username} - Level {self.current_level} ({self.total_points} points)"

    def calculate_level(self):
        """Calculate user level based on experience points"""
        # Simple level calculation: every 1000 XP = 1 level
        return max(1, self.experience_points // 1000 + 1)

    def update_progress(self):
        """Recalculate and update all progress metrics"""
        from django.db.models import Sum

        # Calculate total points from completed problems
        total_points = (
            ProblemCompletion.objects.filter(
                user=self.user, is_completed=True
            ).aggregate(Sum("points_earned"))["points_earned__sum"]
            or 0
        )

        self.total_points = total_points
        self.experience_points = total_points  # For simplicity, XP = points
        self.current_level = self.calculate_level()

        # Find next available problem
        next_problem = None
        for category in ProblemCategory.objects.all():
            if category.is_unlocked_for_user(self.user):
                for problem in category.problems.all():
                    if problem.is_unlocked_for_user(self.user):
                        completion = problem.get_completion_for_user(self.user)
                        if not completion or not completion.is_completed:
                            next_problem = problem
                            break
                if next_problem:
                    break

        if next_problem:
            self.current_problem = next_problem
            self.current_category = next_problem.category

        self.save()

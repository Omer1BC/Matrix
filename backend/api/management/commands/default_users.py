from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import UserProgress

class Command(BaseCommand):
    help = "Create a default admin user with progression"

    def handle(self, *args, **options):
        User = get_user_model()

        # Create superuser if it doesn’t exist
        if not User.objects.filter(username="admin").exists():
            admin_user = User.objects.create_superuser(
                username="admin",
                email="admin@example.com",
                password="password",
                display_name="Administrator",
                bio="Default system administrator",
                is_premium=True,   # optional
            )
            self.stdout.write(self.style.SUCCESS("Admin user created."))

            # Create progression for admin
            UserProgress.objects.create(
                user=admin_user,
                total_points=0,
                current_level=1,
                experience_points=0
            )
            self.stdout.write(self.style.SUCCESS("Admin progression initialized."))
        else:
            self.stdout.write(self.style.WARNING("Admin user already exists."))

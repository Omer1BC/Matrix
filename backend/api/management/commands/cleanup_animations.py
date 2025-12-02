from django.core.management.base import BaseCommand
from utils.agent.utils import cleanup_old_animations


class Command(BaseCommand):
    help = "Clean up old animation tmp directories to free disk space"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=7,
            help="Remove animation directories older than this many days (default: 7)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        self.stdout.write(f"Cleaning up animation directories older than {days} days...")

        result = cleanup_old_animations(days=days)

        removed = result.get("removed_dirs", 0)
        freed_mb = result.get("freed_bytes", 0) / (1024 * 1024)
        errors = result.get("errors", [])

        if removed > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Removed {removed} user directories, freed {freed_mb:.2f} MB"
                )
            )
        else:
            self.stdout.write(self.style.WARNING("No old directories found to remove"))

        if errors:
            self.stdout.write(self.style.ERROR(f"Encountered {len(errors)} errors:"))
            for error in errors[:10]:  # Show first 10 errors
                self.stdout.write(f"  - {error}")

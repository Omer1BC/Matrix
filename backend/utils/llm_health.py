"""
LLM Health Monitoring System

This module provides health check functionality for the OpenAI/LangChain integration.
It detects API key issues, rate limiting, and other service disruptions.
"""

import logging
import smtplib
import os
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from openai import OpenAIError, AuthenticationError, RateLimitError

logger = logging.getLogger(__name__)


class LLMHealthStatus:
    """Tracks the health status of the LLM service."""

    def __init__(self):
        self.is_healthy = True
        self.last_check: Optional[datetime] = None
        self.error_message: str = ""
        self.error_type: str = ""
        self.consecutive_failures = 0
        self.last_notification_sent: Optional[datetime] = None
        # Only send notifications once every 30 minutes to avoid spam
        self.notification_cooldown = timedelta(minutes=30)

    def mark_healthy(self):
        """Mark the service as healthy."""
        self.is_healthy = True
        self.error_message = ""
        self.error_type = ""
        self.consecutive_failures = 0
        self.last_check = datetime.now()

    def mark_unhealthy(self, error_type: str, error_message: str):
        """Mark the service as unhealthy."""
        self.is_healthy = False
        self.error_type = error_type
        self.error_message = error_message
        self.consecutive_failures += 1
        self.last_check = datetime.now()

    def should_send_notification(self) -> bool:
        """Check if enough time has passed to send another notification."""
        if self.last_notification_sent is None:
            return True

        time_since_last = datetime.now() - self.last_notification_sent
        return time_since_last >= self.notification_cooldown

    def notification_sent(self):
        """Mark that a notification was sent."""
        self.last_notification_sent = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert status to dictionary for API responses."""
        return {
            "is_healthy": self.is_healthy,
            "last_check": self.last_check.isoformat() if self.last_check else None,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "consecutive_failures": self.consecutive_failures,
        }


# Global health status instance
_health_status = LLMHealthStatus()


def get_health_status() -> LLMHealthStatus:
    """Get the global health status instance."""
    return _health_status


def ensure_api_key_configured():
    """
    Check if OpenAI API key is configured. Raise an exception if not.

    Raises:
        ValueError: If API key is not configured or empty
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.strip() == "":
        raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.")


def check_llm_health() -> Dict[str, Any]:
    """
    Perform a health check on the LLM service.

    Returns:
        Dictionary with health status information
    """
    # Check if API key is configured
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.strip() == "":
        error_msg = "OpenAI API key is not configured"
        _health_status.mark_unhealthy("configuration_error", error_msg)

        logger.error(f"LLM health check failed: {error_msg}")

        if _health_status.should_send_notification():
            send_admin_notification(
                subject="URGENT: Neo LLM Service - API Key Not Configured",
                error_type="configuration_error",
                error_details="OPENAI_API_KEY environment variable is not set or is empty"
            )
            _health_status.notification_sent()

        return _health_status.to_dict()

    try:
        # Try to create a simple LLM call as a health check
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, max_tokens=10)

        # Make a minimal API call
        response = llm.invoke("Say 'ok'")

        # If we get here, the service is healthy
        _health_status.mark_healthy()

        logger.info("LLM health check passed")
        return _health_status.to_dict()

    except AuthenticationError as e:
        # API key is invalid or revoked
        error_msg = "OpenAI API key is invalid or has been revoked"
        _health_status.mark_unhealthy("authentication_error", error_msg)

        logger.error(f"LLM health check failed: {error_msg}")
        logger.error(f"Details: {str(e)}")

        # Send notification to admin if cooldown period has passed
        if _health_status.should_send_notification():
            send_admin_notification(
                subject="URGENT: Neo LLM Service Down - Authentication Failed",
                error_type="authentication_error",
                error_details=str(e)
            )
            _health_status.notification_sent()

        return _health_status.to_dict()

    except RateLimitError as e:
        # Rate limit exceeded
        error_msg = "OpenAI API rate limit exceeded"
        _health_status.mark_unhealthy("rate_limit_error", error_msg)

        logger.warning(f"LLM health check failed: {error_msg}")
        logger.warning(f"Details: {str(e)}")

        if _health_status.should_send_notification():
            send_admin_notification(
                subject="WARNING: Neo LLM Service - Rate Limit Exceeded",
                error_type="rate_limit_error",
                error_details=str(e)
            )
            _health_status.notification_sent()

        return _health_status.to_dict()

    except OpenAIError as e:
        # Other OpenAI-specific errors
        error_msg = f"OpenAI API error: {str(e)}"
        _health_status.mark_unhealthy("openai_error", error_msg)

        logger.error(f"LLM health check failed: {error_msg}")

        if _health_status.should_send_notification():
            send_admin_notification(
                subject="ERROR: Neo LLM Service Issue Detected",
                error_type="openai_error",
                error_details=str(e)
            )
            _health_status.notification_sent()

        return _health_status.to_dict()

    except Exception as e:
        # Generic error
        error_msg = f"Unexpected error: {str(e)}"
        _health_status.mark_unhealthy("unknown_error", error_msg)

        logger.error(f"LLM health check failed with unexpected error: {error_msg}")

        if _health_status.should_send_notification():
            send_admin_notification(
                subject="ERROR: Neo LLM Service - Unknown Issue",
                error_type="unknown_error",
                error_details=str(e)
            )
            _health_status.notification_sent()

        return _health_status.to_dict()


def send_admin_notification(subject: str, error_type: str, error_details: str):
    """
    Send email notification to system administrator about LLM service issues.

    Args:
        subject: Email subject line
        error_type: Type of error encountered
        error_details: Detailed error information
    """
    # Configuration from environment variables
    admin_email = os.getenv("ADMIN_EMAIL")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Skip if email is not configured
    if not all([admin_email, smtp_user, smtp_password]):
        logger.warning(
            "Email notification skipped: ADMIN_EMAIL, SMTP_USER, or SMTP_PASSWORD not configured"
        )
        # Log to console/file as fallback
        logger.critical(
            f"NEO SERVICE ALERT: {subject}\n"
            f"Error Type: {error_type}\n"
            f"Details: {error_details}\n"
            f"Time: {datetime.now().isoformat()}"
        )
        return

    try:
        # Create email message
        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = admin_email
        msg["Subject"] = subject

        # Email body
        body = f"""
        <html>
        <body>
            <h2 style="color: #d32f2f;">Neo LLM Service Alert</h2>
            <p><strong>Error Type:</strong> {error_type}</p>
            <p><strong>Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p><strong>Details:</strong></p>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">{error_details}</pre>

            <h3>Recommended Actions:</h3>
            <ul>
                {'<li>Check and update the OPENAI_API_KEY in your environment variables</li>' if error_type == 'authentication_error' else ''}
                {'<li>Verify your OpenAI account status and billing</li>' if error_type in ['authentication_error', 'rate_limit_error'] else ''}
                {'<li>Check OpenAI API status page: https://status.openai.com/</li>'}
                <li>Review server logs for additional context</li>
                <li>Restart the backend service after resolving the issue</li>
            </ul>

            <p style="color: #666; font-size: 12px;">
                This is an automated notification from the Matrix application.
                The Neo LLM service is currently unavailable to users.
            </p>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, "html"))

        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

        logger.info(f"Admin notification sent successfully to {admin_email}")

    except Exception as e:
        logger.error(f"Failed to send admin notification email: {str(e)}")
        # Ensure critical error is still logged even if email fails
        logger.critical(
            f"NEO SERVICE ALERT (Email failed): {subject}\n"
            f"Error Type: {error_type}\n"
            f"Details: {error_details}"
        )


def wrap_llm_call(func):
    """
    Decorator to wrap LLM calls with health monitoring.

    Usage:
        @wrap_llm_call
        def my_llm_function():
            llm = ChatOpenAI(...)
            return llm.invoke(...)
    """
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            # Mark as healthy on successful call
            _health_status.mark_healthy()
            return result
        except AuthenticationError as e:
            error_msg = "OpenAI API authentication failed"
            _health_status.mark_unhealthy("authentication_error", error_msg)

            if _health_status.should_send_notification():
                send_admin_notification(
                    subject="URGENT: Neo LLM Service Down - Authentication Failed",
                    error_type="authentication_error",
                    error_details=str(e)
                )
                _health_status.notification_sent()

            raise
        except (RateLimitError, OpenAIError) as e:
            error_type = "rate_limit_error" if isinstance(e, RateLimitError) else "openai_error"
            _health_status.mark_unhealthy(error_type, str(e))

            if _health_status.should_send_notification():
                send_admin_notification(
                    subject=f"WARNING: Neo LLM Service Issue - {error_type}",
                    error_type=error_type,
                    error_details=str(e)
                )
                _health_status.notification_sent()

            raise

    return wrapper

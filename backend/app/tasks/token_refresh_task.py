import os
import logging
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

logger = logging.getLogger(__name__)

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TOKEN_PATH = os.path.join(_BACKEND_DIR, "token.json")
SCOPES = ["https://www.googleapis.com/auth/calendar"]


def refresh_calendar_token():
    """Refresh Google Calendar token to prevent expiration."""
    try:
        if not os.path.exists(TOKEN_PATH):
            logger.warning(f"Token file not found at {TOKEN_PATH}, skipping refresh")
            return False

        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Save refreshed token
            with open(TOKEN_PATH, "w") as token_file:
                token_file.write(creds.to_json())
            logger.info("Calendar token refreshed successfully")
            return True
        else:
            logger.info("Calendar token is still valid")
            return True

    except Exception as e:
        logger.error(f"Failed to refresh calendar token: {e}")
        return False

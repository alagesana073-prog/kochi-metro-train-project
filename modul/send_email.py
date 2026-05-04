import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")

# Default fallback mapping (used only when no custom recipients are provided)
CATEGORY_EMAILS = {
    "telecommunication": ["railwaytelecommunication@gmail.com"],
    "traffic": ["railwaytraffic@gmail.com"],
    "medical": ["railwaymedical@gmail.com"],
    "finance": ["railwayfinance@gmail.com"],
    "maintenance": ["railwaymaintenance@gmail.com"],
    "management": ["railwaymanagement@gmail.com"],
    "security": ["railwaysecurity@gmail.com"],
    "signaling": ["railwaysignaling@gmail.com"]
}

def send_email(category, message, file_path=None, custom_recipients=None):
    """
    Send email to department recipients.
    If custom_recipients list is provided, use those instead of the default mapping.
    """
    # Use custom recipients if provided, otherwise fall back to default mapping
    if custom_recipients and len(custom_recipients) > 0:
        recipients = custom_recipients
    else:
        recipients = CATEGORY_EMAILS.get(category.lower(), [])

    if not recipients:
        print(f"[WARNING] No recipients for: {category}")
        return False

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        for r in recipients:

            msg = MIMEMultipart()
            msg["From"] = SENDER_EMAIL
            msg["To"] = r
            msg["Subject"] = f"[KMTP] {category.upper()} ALERT"

            # Body
            msg.attach(MIMEText(message, "plain"))

            # 📎 Attach file
            if file_path and os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(f.read())

                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename={os.path.basename(file_path)}"
                )
                msg.attach(part)

            server.send_message(msg)

        server.quit()
        print(f"[OK] Email with attachment sent to {category} -> {recipients}")
        return True

    except Exception as e:
        print(f"[ERROR] Email Error: {e}")
        return False
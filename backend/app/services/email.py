import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import get_settings

settings = get_settings()

def send_email(to_email: str, subject: str, body: str):
    # For demo, just print to console
    print(f"[EMAIL] To: {to_email}, Subject: {subject}, Body: {body}")
    # In production, use SendGrid, SMTP, etc.
    # Example with SMTP:
    # msg = MIMEMultipart()
    # msg['From'] = settings.smtp_from
    # msg['To'] = to_email
    # msg['Subject'] = subject
    # msg.attach(MIMEText(body, 'plain'))
    # with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
    #     server.starttls()
    #     server.login(settings.smtp_user, settings.smtp_password)
    #     server.send_message(msg)
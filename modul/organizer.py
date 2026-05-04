import os
import shutil
from ocr_engine import extract_text
from classifier import classify_text
from send_email import send_email

def organize_document(file_path, custom_recipients=None):
    """
    Process a document: extract text via OCR, classify it, organize into folders,
    and send email if high priority.
    
    Returns: (topic, priority) tuple
    """
    text = extract_text(file_path)

    if not text.strip():
        return "unknown", "low"

    topic, priority = classify_text(text)

    # Create organized folder structure
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    folder = os.path.join(BASE_DIR, "organized", topic, priority)
    os.makedirs(folder, exist_ok=True)
    shutil.copy(file_path, folder)

    # 🔥 AUTO EMAIL SEND — only for high priority documents
    if topic != "unknown" and priority == "high":
        message = f"""[ALERT] New Document Alert - Kochi Metro Train Project

File: {os.path.basename(file_path)}
Department: {topic}
Priority: {priority}

This document has been automatically classified and routed by the KMTP Document Organizer.
"""
        send_email(topic, message, file_path, custom_recipients)

    return topic, priority
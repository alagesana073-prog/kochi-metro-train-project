from classifier import classify_text
from send_email import send_email

def process_text(text):
    topic, priority = classify_text(text)

    print("Predicted:", topic)

    send_email(topic, text)

    return topic
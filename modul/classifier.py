import pickle

import os

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models
vectorizer = pickle.load(open(os.path.join(BASE_DIR, "models/vectorizer.pkl"), "rb"))
topic_model = pickle.load(open(os.path.join(BASE_DIR, "models/topic_model.pkl"), "rb"))
priority_model = pickle.load(open(os.path.join(BASE_DIR, "models/priority_model.pkl"), "rb"))

def classify_text(text):
    vec = vectorizer.transform([text])

    topic = topic_model.predict(vec)[0]
    priority = priority_model.predict(vec)[0]

    return topic, priority
import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Use paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Create models folder
models_dir = os.path.join(BASE_DIR, "models")
os.makedirs(models_dir, exist_ok=True)

# Load dataset
dataset_path = os.path.join(BASE_DIR, "dataset.csv")
data = pd.read_csv(dataset_path)

X = data["text"]
y_topic = data["topic"]
y_priority = data["priority"]

# Convert text → vectors
vectorizer = TfidfVectorizer(stop_words="english")
X_vec = vectorizer.fit_transform(X)

# Train models
topic_model = LogisticRegression()
priority_model = LogisticRegression()

topic_model.fit(X_vec, y_topic)
priority_model.fit(X_vec, y_priority)

# Save models
pickle.dump(vectorizer, open(os.path.join(models_dir, "vectorizer.pkl"), "wb"))
pickle.dump(topic_model, open(os.path.join(models_dir, "topic_model.pkl"), "wb"))
pickle.dump(priority_model, open(os.path.join(models_dir, "priority_model.pkl"), "wb"))

print("[OK] Model trained and saved to", models_dir)
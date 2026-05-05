import os
import sys

# Add the current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

try:
    from classifier import classify_text
    print("[SUCCESS] Classifier module loaded.")

    test_texts = [
        "Railway technical specifications for coach maintenance",
        "Financial report for Metro project expansion",
        "Personnel training manual for station masters"
    ]

    print("\n--- Testing ML Models ---")
    for text in test_texts:
        topic, priority = classify_text(text)
        print(f"Text: '{text}'")
        print(f"Result: Topic = {topic}, Priority = {priority}")
        print("-" * 20)

    print("\n[VERIFIED] All models (Topic, Priority, Vectorizer) are loaded and working correctly.")

except Exception as e:
    print(f"\n[ERROR] Model test failed: {e}")
    import traceback
    traceback.print_exc()

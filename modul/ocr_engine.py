import pytesseract
import cv2
import numpy as np
import pandas as pd
from pdf2image import convert_from_path
import os

# Auto-detect Tesseract path
TESSERACT_PATHS = [
    r"D:\project\adl\Tesseract\tesseract.exe",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    "/usr/bin/tesseract",
    "/usr/local/bin/tesseract"
]

tesseract_found = False
for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        tesseract_found = True
        print(f"[OK] Tesseract found at: {path}")
        break

if not tesseract_found:
    print("[WARNING] Tesseract not found! OCR for images/PDFs will not work.")
    print("   Searched paths:", TESSERACT_PATHS)

# Poppler paths for PDF conversion
POPPLER_PATHS = [
    r"C:\poppler\Library\bin",
    "/usr/bin",
    "/usr/local/bin"
]


def extract_text(file_path):
    """Extract text from various file formats using OCR."""
    text = ""

    try:
        # PDF files
        if file_path.lower().endswith(".pdf"):
            poppler_path = None
            for pp in POPPLER_PATHS:
                if os.path.exists(pp):
                    poppler_path = pp
                    break

            if poppler_path:
                pages = convert_from_path(
                    file_path,
                    dpi=200,
                    poppler_path=poppler_path
                )

                for page in pages:
                    img = np.array(page)
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    text += pytesseract.image_to_string(gray)
            else:
                print(f"[WARNING] Poppler not found, cannot process PDF: {file_path}")

        # Image files
        elif file_path.lower().endswith((".png", ".jpg", ".jpeg")):
            img = cv2.imread(file_path)

            if img is None:
                print(f"[WARNING] Cannot read image: {file_path}")
                return ""

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray)

        # TXT files
        elif file_path.lower().endswith(".txt"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        # CSV files
        elif file_path.lower().endswith(".csv"):
            df = pd.read_csv(file_path)
            text = df.to_string()

        else:
            print(f"[WARNING] Unsupported file type: {file_path}")

    except Exception as e:
        print(f"[ERROR] Error extracting text from {file_path}: {e}")

    return text
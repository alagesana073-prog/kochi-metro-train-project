from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from organizer import organize_document

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": "*",
    "expose_headers": "*",
    "supports_credentials": False
}})

# Use absolute path for uploads relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, '..', 'temp_uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for frontend to verify backend is running."""
    return jsonify({"status": "ok", "message": "KMTP Backend is running"})

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to show a friendly message instead of a 404."""
    return "<h1>KMRL Backend API is running successfully!</h1><p>Please visit the main website to use the application.</p>"


@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"error": "No files part"}), 400

    # Get custom department mapping if provided
    mapping_str = request.form.get('mapping', '{}')
    try:
        mapping = json.loads(mapping_str)
    except Exception:
        mapping = {}

    files = request.files.getlist('files')
    results = []

    for file in files:
        if file.filename == '':
            continue

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        try:
            # Run the ML pipeline: OCR → Classify → Organize → Email
            # First classify to get the topic, then look up recipients
            topic, priority = organize_document(file_path)

            # If we have custom recipients from the frontend, re-run with them
            recipients = mapping.get(topic.lower(), [])
            if recipients:
                topic, priority = organize_document(file_path, custom_recipients=recipients)

            # Determine status based on priority
            status = "Emailed" if priority == "high" else "Saved"

            # Read snippet of content for the UI
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(200).strip()
                    if len(content) > 100:
                        content = content[:100] + "..."
            except Exception:
                content = "Binary file"

            results.append({
                "title": file.filename,
                "content": content,
                "topic": topic,
                "priority": priority,
                "status": status
            })

        except Exception as e:
            print(f"[ERROR] Error processing {file.filename}: {e}")
            import traceback
            traceback.print_exc()
            results.append({
                "title": file.filename,
                "content": "",
                "topic": "unknown",
                "priority": "low",
                "status": "Saved",
                "error": str(e)
            })
        finally:
            # Clean up temp file
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass

    return jsonify(results)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[START] KMTP Backend API starting on port {port}")
    app.run(host='0.0.0.0', port=port)

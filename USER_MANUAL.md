# 🚆 Kochi Metro Train Project (KMTP) - User Manual

Welcome to the KMTP Document Management System! This application uses Machine Learning (ML) and Optical Character Recognition (OCR) to automatically classify and route metro-related documents.

---

## 🚀 1. How to Start the System

### **Option A: Running Locally (For Development)**
1.  Open a terminal in the `frontend` folder and run:  
    `npm run dev`  
2.  Open another terminal in the `modul` folder and run:  
    `py api.py`
3.  Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

### **Option B: Running Online (For Remote Access)**
1.  **Start the Backend**: Double-click **`run_backend_online.bat`** in the main folder.
2.  **Bypass Warning**: Open the tunnel URL (e.g., `https://...loca.lt`) and click "Click to Continue".
3.  **Visit the Website**: Go to **[https://kochi-metro-train-projec-25477.web.app](https://kochi-metro-train-projec-25477.web.app)**.

---

## 📂 2. Features and Usage

### **🔐 Authentication**
*   **Login**: Enter your admin email and password.
*   **Register**: If you don't have an account, use the "Sign Up" link to create one. Your data is securely stored in Firebase.

### **📊 Dashboard (The ML Engine)**
*   **System Status**: Check the bottom-left panel. "ACTIVE" means the Python ML engine is connected.
*   **Upload Bunch**: Click "Upload Files" to select multiple documents (PDFs, Images, CSVs).
*   **Automatic Processing**:
    *   **OCR**: Extracts text from images and scanned PDFs.
    *   **Classification**: ML models (Topic & Priority) categorize the document.
    *   **Routing**: Documents are assigned to the correct department based on your settings.
    *   **Emailing**: If priority is **HIGH**, an automated email notification is triggered.

### **🏢 Departments**
*   Manage your routing rules here.
*   Add a department name (e.g., "TRAFFIC", "FINANCE") and an email address.
*   The system uses these emails to route classified documents automatically.

### **📜 Transaction History**
*   View all past uploads, their classification results, and their processing status.

---

## 🛠️ 3. Maintenance and Updates

### **Pushing Changes to GitHub**
Whenever you modify the code (Frontend or Python API), simply **double-click `push_to_github.bat`**. 
*   This will save your code to GitHub.
*   GitHub Actions will automatically redeploy the website to Firebase for you.

### **Updating the API URL**
If the Localtunnel URL changes:
1.  Edit `frontend/.env.production`.
2.  Update `VITE_API_URL` with the new link.
3.  Run `push_to_github.bat`.

---

## ⚙️ 4. Technical Architecture
*   **Frontend**: React + Vite + Tailwind CSS (Hosted on Firebase).
*   **Database**: Firebase Firestore (Real-time storage).
*   **Auth**: Firebase Authentication.
*   **Backend**: Python Flask API (ML Engine).
*   **OCR**: Tesseract OCR.
*   **ML**: Scikit-Learn (Topic & Priority Models).

---

**For any technical issues, please refer to the `README.md` or contact the administrator.**

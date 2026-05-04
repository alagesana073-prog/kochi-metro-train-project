import customtkinter as ctk
from tkinter import filedialog
import os
import threading
from organizer import organize_document

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class App(ctk.CTk):

    def __init__(self):

        super().__init__()

        self.title("AI Document Organizer")
        self.geometry("800x600")

        self.files = []

        # Title
        title = ctk.CTkLabel(self, text="AI Document Organizer", font=("Arial", 26))
        title.pack(pady=20)

        # Select Folder Button
        folder_btn = ctk.CTkButton(self, text="Select Folder", command=self.select_folder)
        folder_btn.pack(pady=10)

        # Process Button
        process_btn = ctk.CTkButton(self, text="Process Documents", command=self.process_files)
        process_btn.pack(pady=10)

        # File list box
        self.file_box = ctk.CTkTextbox(self, height=120)
        self.file_box.pack(fill="x", padx=20, pady=10)

        # Results box
        self.result_box = ctk.CTkTextbox(self)
        self.result_box.pack(fill="both", expand=True, padx=20, pady=10)

        # Progress bar
        self.progress = ctk.CTkProgressBar(self)
        self.progress.pack(fill="x", padx=20, pady=10)
        self.progress.set(0)

    def select_folder(self):

        folder = filedialog.askdirectory(title="Select Folder")

        if folder:

            self.files = []

            self.file_box.delete("1.0", "end")

            for file in os.listdir(folder):

                if file.lower().endswith((".pdf", ".png", ".jpg", ".jpeg", ".txt", ".docx", ".xlsx", ".pptx", ".csv")):

                    full_path = os.path.join(folder, file)

                    self.files.append(full_path)

                    self.file_box.insert("end", file + "\n")

    def process_files(self):

        if not self.files:
            self.result_box.insert("end", "No files selected\n")
            return

        self.result_box.insert("end", "Processing documents...\n")

        self.progress.set(0)

        thread = threading.Thread(target=self.run_processing)
        thread.start()

    def run_processing(self):

        total = len(self.files)

        for i, file in enumerate(self.files, start=1):

            topic, priority = organize_document(file)

            self.result_box.insert(
                "end",
                f"{os.path.basename(file)} → {topic} | {priority}\n"
            )

            self.progress.set(i / total)

        self.result_box.insert("end", "\n✅ Processing Completed!\n")
app = App()
app.mainloop()
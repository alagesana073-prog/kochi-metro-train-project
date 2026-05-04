import tkinter as tk
from main import process_text

def submit_text():
    text = text_box.get("1.0", "end").strip()

    if not text:
        result_label.config(text="Enter some text")
        return

    category = process_text(text)
    result_label.config(text=f"Category: {category}")


# UI
root = tk.Tk()
root.title("ML Auto Mail Sender")
root.geometry("400x300")

label = tk.Label(root, text="Enter Text:")
label.pack()

text_box = tk.Text(root, height=8, width=40)
text_box.pack()

submit_btn = tk.Button(root, text="Send Email", command=submit_text)
submit_btn.pack(pady=10)

result_label = tk.Label(root, text="")
result_label.pack()

root.mainloop()
import tkinter as tk
from PIL import Image, ImageTk
import threading
import subprocess
import os
import psutil
import datetime

def animate_title(bot_version):
    title = f"Kittys Build Bot {bot_version}                                 ."
    animated_title = title[1:] + title[0]

    def update_title():
        nonlocal animated_title
        animated_title = animated_title[1:] + animated_title[0]
        title_label.config(text=animated_title)
        root.after(500, update_title)

    update_title()

def update_system_usage():
    cpu_percent = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory()
    ram_percent = memory.percent

    cpu_label.config(text=f"CPU Usage: {cpu_percent}%", fg="green")
    ram_label.config(text=f"RAM Usage: {ram_percent}%", fg="green")
    if cpu_percent >= 30:
        cpu_label.config(fg="yellow")
    else:
        cpu_label.config(fg="green")  # Set the default text color
    if ram_percent >= 30:
        ram_label.config(fg="yellow")
    else:
        ram_label.config(fg="green")  # Set the default text color
    if cpu_percent >= 70:
        cpu_label.config(fg="red")
    if ram_percent >= 70:
        ram_label.config(fg="red")

    root.after(1000, update_system_usage)

def update_current_time():
    current_time = datetime.datetime.now().strftime("%I:%M:%S %p")
    console_output.insert(tk.END, f"--------------------------------------------\nCurrent Time: [{current_time}]\n--------------------------------------------\n", "time")
    console_output.tag_config("time", foreground="green")
    root.after(3600000, update_current_time)

def read_bot_version():
    try:
        with open("keys/keys.js", "r") as file:
            for line in file:
                if "const BOT_VERSION" in line:
                    return line.split("=")[1].strip()
    except FileNotFoundError:
        return "Unknown"

def run_subprocess(command, button_to_disable, buttons_to_enable):
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        encoding='utf-8'
    )
    button_to_disable.config(state=tk.DISABLED)
    status_light.config(bg="yellow")

    for line in process.stdout:
        if 'Commands' in line:
            console_output.insert(tk.END, line, 'red')
        else:
            console_output.insert(tk.END, line)
            console_output.see(tk.END)
    process.wait()

    button_to_disable.config(state=tk.NORMAL)  # Re-enable the button
    status_light.config(bg="green")
    for button in buttons_to_enable:
        button.config(state=tk.NORMAL)  # Re-enable other buttons

def start_bot():
    console_output.insert(tk.END, "--------------------------------------------\nStarting Bot!!\n--------------------------------------------\n", "start")
    console_output.tag_config("start", foreground="green")
    start_button.config(state=tk.DISABLED)
    update_button.config(state=tk.DISABLED)
    threading.Thread(target=run_subprocess, args=(["node", "index.js"], start_button, [update_button])).start()

def update_npm():
    console_output.insert(tk.END, "--------------------------------------------\nStarting Updates...\n--------------------------------------------\n", "update")
    console_output.tag_config("update", foreground="green")
    threading.Thread(target=run_subprocess, args=(["update.bat"], update_button, [start_button])).start()
    start_button.config(state=tk.DISABLED)  # Disable the "Start Bot" button

def open_folder():
    console_output.insert(tk.END, "--------------------------------------------\nOpening Build Bot Files Location...\n--------------------------------------------\n", "open")
    console_output.tag_config("open", foreground="green")
    folder_path = os.path.join(os.path.dirname(os.path.realpath(__file__)))
    subprocess.Popen(['explorer', folder_path])

def restart_program():
    console_output.insert(tk.END, "--------------------------------------------\nRestarting....\n--------------------------------------------\n", "restart")
    console_output.tag_config("restart", foreground="red")
    start_button.config(state=tk.DISABLED)
    update_button.config(state=tk.DISABLED)
    threading.Thread(target=run_subprocess, args=(["restart.bat"], update_button, [start_button])).start()

def button_hover(event):
    event.widget.config(bg="#777777")

def button_leave(event):
    event.widget.config(bg="#292929")

def process_user_input(event):
    selected_bot_value = selected_bot.get()
    user_input_value = user_input.get()
    if selected_bot_value:
        user_input_value = f"{selected_bot_value} {user_input_value}"

    user_input.delete(0, tk.END)
    file_path = "BotMessage.txt"

    # Check if the file exists
    if os.path.exists(file_path):
        os.remove(file_path)
        
    # Create the text file and write the user input to it
    with open(file_path, "a") as file:
        file.write(user_input_value + "\n")
        console_output.insert(tk.END, f"[{selected_bot_value}] Creating Minecraft Message...\n")
        console_output.see(tk.END)
        
def clear_user_input(event):
    if user_input.get() == " Send Message Here:":
        user_input.delete(0, tk.END)
        user_input.config(fg="white")  # Reset the text color

def reset_user_input(event):
    if user_input.get().strip() == "":
        user_input.delete(0, tk.END)
        user_input.insert(0, " Send Message Here:")
        user_input.config(fg="gray")  # Change the text color to gray

# Create the main window
root = tk.Tk()
root.title("Kittys Build Bot")
root.configure(bg="#292929")
root.option_add("*foreground", "white")
root.option_add("*background", "#292929")
root.geometry("400x500")
root.resizable(True, True)  # Disallow window resizing

# Load the GIF background
background_image = Image.open("background.gif")

# Calculate the desired width and height while maintaining the aspect ratio
desired_width = 100
aspect_ratio = background_image.width / background_image.height
desired_height = int(desired_width / aspect_ratio)

# Resize the image
resized_image = background_image.resize((desired_width, desired_height), Image.LANCZOS)
background_photo = ImageTk.PhotoImage(resized_image)

# Create the label and place it at the desired position
background_label = tk.Label(root, image=background_photo)
background_label.place(relx=0.80, rely=0.02)

# Get the bot version
bot_version = read_bot_version()

# Create and configure widgets
title_label = tk.Label(root, text=f"", font=("Arial", 18, "bold"))
title_label.grid(row=0, column=0, columnspan=2, pady=(10, 0))

version_label = tk.Label(root, text="Bot Version: " + read_bot_version(), font=("Arial", 12))
version_label.grid(row=1, column=0, columnspan=2, pady=(5, 0))

button_frame = tk.Frame(root)
button_frame.grid(row=2, column=0, columnspan=2, pady=20)

start_button = tk.Button(button_frame, text="Start Bot", font=("Arial", 10, "bold"), bd=1, width=8, command=start_bot)
start_button.grid(row=0, column=0, padx=1, sticky="ew")
start_button.bind("<Enter>", button_hover)
start_button.bind("<Leave>", button_leave)

update_button = tk.Button(button_frame, text="Update NPM's", font=("Arial", 14, "bold"), width=12, command=update_npm)
update_button.grid(row=0, column=1, padx=5, sticky="ew")
update_button.bind("<Enter>", button_hover)
update_button.bind("<Leave>", button_leave)

folder_button = tk.Button(root, text="Files", font=("Arial", 14, "bold"), width=12, command=open_folder)
folder_button.grid(row=3, column=0, padx=(20, 5), pady=10, sticky="w")
folder_button.bind("<Enter>", button_hover)
folder_button.bind("<Leave>", button_leave)

restart_button = tk.Button(root, text="Restart", font=("Arial", 14, "bold"), width=12, command=restart_program)
restart_button.grid(row=3, column=1, padx=(5, 20), pady=10, sticky="e")
restart_button.bind("<Enter>", button_hover)
restart_button.bind("<Leave>", button_leave)

console_output = tk.Text(root, width=80, height=20, font=("Courier New", 10), bg="#121212", fg="white")
console_output.grid(row=4, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")

cpu_label = tk.Label(root, text="", font=("Arial", 12))
cpu_label.grid(row=5, column=0, pady=(0, 10), sticky="w", padx=(10, 10))

ram_label = tk.Label(root, text="", font=("Arial", 12))
ram_label.grid(row=5, column=1, pady=(0, 10), sticky="w", padx=(0, 0))

status_light = tk.Label(root, width=2, height=1, bg="green", bd=1, relief="solid", borderwidth=2)
status_light.grid(row=5, column=1, pady=(0, 10), sticky="se", padx=(10, 10))

# Create the dropdown menu options
bot_options = ["bot1", "bot2", "bot3", "bot4", "bot5", "bot6", "bot7", "bot8", "bot9", "bot10"]

# Create the dropdown menu variable
selected_bot = tk.StringVar(root)
selected_bot.set(bot_options[0])  # Set the initial value

# Create the dropdown menu
bot_dropdown = tk.OptionMenu(root, selected_bot, *bot_options)
bot_dropdown.config(font=("Arial", 14), width=10)
bot_dropdown.grid(row=6, column=0, padx=(10, 10), pady=(10, 20), sticky="w")
bot_dropdown.bind("<Enter>", button_hover)
bot_dropdown.bind("<Leave>", button_leave)

# Create the user input box
user_input = tk.Entry(root, font=("Arial", 14), highlightthickness=2, highlightcolor="white")
user_input.insert(0, " Send Message Here:")
user_input.bind("<FocusIn>", clear_user_input)
user_input.bind("<FocusOut>", reset_user_input)
user_input.grid(row=6, column=1, padx=(5, 10), pady=(10, 20), sticky="e", ipady=4) 
user_input.bind("<Return>", lambda event: process_user_input(event))
user_input.bind("<Enter>", button_hover)
user_input.bind("<Leave>", button_leave)

# Configure grid weights for resizing
root.grid_rowconfigure(4, weight=1)
root.grid_columnconfigure(0, weight=1)
root.grid_columnconfigure(1, weight=1)

# Start updating system usage
update_system_usage()

# Start updating current time
update_current_time()

# Start animating the title
animate_title(bot_version)

# Run the main event loop
root.mainloop()
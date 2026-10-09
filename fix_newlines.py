import os

directory = "c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".js") or file.endswith(".json") or file.endswith(".html") or file.endswith(".css"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if content.endswith("\\n"):
                content = content[:-2] + "\n"
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
print("Removed literal \\n from the end of files.")


import zipfile
import os

folder_path = 'd:/Project/cronos/0rca-agent-starter'
zip_path = 'd:/Project/cronos/0rca-agent-starter.zip'

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Skip hidden and excluded directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['venv', '.venv', '__pycache__', 'node_modules']]
            
            for file in files:
                if file in ['agent_local.db', 'agent_server.log']:
                    continue
                file_path = os.path.join(root, file)
                # Keep the relative path inside the zip
                rel_path = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, rel_path)
                print(f"Added: {rel_path}")

print("Zipping 0rca-agent-starter...")
zip_folder(folder_path, zip_path)
print(f"ZIP created at {zip_path}")
print(f"Size: {os.path.getsize(zip_path)} bytes")

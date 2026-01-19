
import os

root_dir = 'd:/Project/cronos'
old_addr = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"
new_addr = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"

skip_dirs = {'.git', 'node_modules', '.next', '__pycache__', 'dist', '.venv', 'venv'}
valid_extensions = {'.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.md', '.env', '.local', '.sh', '.yaml', '.yml', '.ts', '.css', '.html'}

files_updated = 0

print(f"Starting global replacement of {old_addr} -> {new_addr}")

for root, dirs, files in os.walk(root_dir):
    # Filter directories to skip
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    
    for file in files:
        ext = os.path.splitext(file)[1]
        if ext in valid_extensions or file.startswith('.env'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if old_addr in content:
                    print(f"Updating: {path}")
                    new_content = content.replace(old_addr, new_addr)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    files_updated += 1
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"\nSuccessfully updated {files_updated} files.")

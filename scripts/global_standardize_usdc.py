
import os

def replace_in_file(path, old, new):
    if not os.path.exists(path):
        print(f'{path} not found')
        return
    with open(path, 'r') as f:
        content = f.read()
    if old in content:
        new_content = content.replace(old, new)
        with open(path, 'w') as f:
            f.writelines(new_content)
        print(f'Updated {path}')
    else:
        print(f'"{old}" not found in {path}')

t_usdc = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"
dev_usdc = "0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1"

# Update 0rca_chat/.env.local
replace_in_file('d:/Project/cronos/0rca_chat/.env.local', dev_usdc, t_usdc)

# Update CroGas/.env
replace_in_file('d:/Project/cronos/CroGas/.env', dev_usdc, t_usdc)

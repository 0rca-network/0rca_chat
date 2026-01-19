
import os

env_path = 'd:/Project/cronos/CroGas/.env'
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        print(f.read())
else:
    print('.env not found')

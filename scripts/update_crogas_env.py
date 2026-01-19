
import os

path = 'd:/Project/cronos/CroGas/.env'
with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('USDC_ADDRESS='):
        new_lines.append('USDC_ADDRESS=0x38Bf87D7281A2F84c8ed5aF1410295f7BD4E20a1\n')
    else:
        new_lines.append(line)

with open(path, 'w') as f:
    f.writelines(new_lines)
print('Updated USDC_ADDRESS in .env')
